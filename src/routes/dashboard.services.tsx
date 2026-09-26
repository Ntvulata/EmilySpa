import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2, CreditCard } from "lucide-react";
import { useState, type FormEvent } from "react";

import { formatVnd, therapists, serviceOptions, masterPackages } from "@/lib/spa-data";
import { fbSaveService, fbDeleteService, fbSaveTherapist, fbDeleteTherapist, fbSaveMasterPackage, fbDeleteMasterPackage } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/services")({
  head: () => ({
    meta: [
      { title: "Dịch vụ & nhân viên | Emily Spa" },
      { name: "description", content: "Danh mục dịch vụ, bảng giá và đội ngũ kỹ thuật viên của Emily Spa." },
      { property: "og:title", content: "Dịch vụ & nhân viên | Emily Spa" },
      { property: "og:description", content: "Quản lý bảng giá dịch vụ và đội ngũ kỹ thuật viên Emily Spa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

const initialServices = [
  { name: "Massage đá nóng 90'", duration: "90 phút", price: 750000 },
  { name: "Chăm sóc da chuyên sâu", duration: "75 phút", price: 980000 },
  { name: "Gội đầu dưỡng sinh", duration: "60 phút", price: 450000 },
  { name: "Triệt lông công nghệ cao", duration: "45 phút", price: 1650000 },
  { name: "Body detox thải độc", duration: "80 phút", price: 1200000 },
  { name: "Trẻ hoá da ánh sáng sinh học", duration: "90 phút", price: 2100000 },
];

const initialPackages = [
  { id: "PK1", name: "Thẻ chăm sóc da 10 buổi", type: "sessions", value: 10, price: 8000000 },
  { id: "PK2", name: "Thẻ tài khoản 10 triệu", type: "balance", value: 10000000, price: 8500000 },
];

const roles = ["Kỹ thuật viên", "Lễ tân", "Quản lý"];

const initialStaff = therapists.map((t) => ({ name: t.name, phone: "", role: "Kỹ thuật viên", sessions: t.sessions }));

const inputClass =
  "w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none transition focus:border-emerald";
const editBtn =
  "inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-emerald/40 hover:text-emerald";

function ServicesPage() {
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"services" | "packages" | "staff">("services");
  const [searchService, setSearchService] = useState("");
  const [searchPackage, setSearchPackage] = useState("");

  // Services
  const [services, setServices] = useState(serviceOptions.map(s => ({ duration: "60 phút", ...s })));
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const emptyService = { id: "", name: "", duration: "60", price: "" };
  const [form, setForm] = useState(emptyService);
  const update = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    let val = e.target.value;
    if (key === "price") {
      const num = val.replace(/\D/g, "");
      val = num ? Number(num).toLocaleString("en-US") : "";
    }
    setForm((f) => ({ ...f, [key]: val }));
  };

  const editService = (i: number) => {
    const s = services[i]!;
    setForm({ id: s.id, name: s.name, duration: s.duration.replace(/\D/g, ""), price: s.price ? Number(s.price).toLocaleString("en-US") : "" });
    setEditIdx(i);
    setOpen(true);
    setError("");
    setNotice("");
  };

  const deleteService = (i: number) => {
    if (window.confirm("Bạn có thật sự muốn xóa?")) {
      const s = services[i];
      setServices((l) => l.filter((_, idx) => idx !== i));
      serviceOptions.splice(i, 1);
      fbDeleteService(s.id).catch(console.error);
      setNotice("Đã xóa dịch vụ thành công.");
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price.replace(/\D/g, ""));
    const minutes = Number(form.duration);
    if (!name || !price || !minutes) return setError("Vui lòng nhập tên dịch vụ, thời lượng và giá.");
    if (services.some((s, i) => i !== editIdx && s.name.toLowerCase() === name.toLowerCase()))
      return setError("Dịch vụ này đã có trong danh mục.");
    const item = { id: form.id || ("SRV_" + Date.now()), name, duration: `${minutes} phút`, price };
    if (editIdx !== null) {
      const oldName = services[editIdx].name;
      setServices((l) => l.map((s, i) => (i === editIdx ? item : s)));
      serviceOptions[editIdx] = item;
      
      setNotice(`Đã cập nhật dịch vụ ${name}.`);
    } else {
      setServices((l) => [...l, item]);
      serviceOptions.push(item);
      setNotice(`Đã thêm dịch vụ ${name}.`);
    }
    fbSaveService(item).catch(console.error);
    setError("");
    setOpen(false);
    setEditIdx(null);
    setForm(emptyService);
  };

  // Packages
  const [packages, setPackages] = useState([...masterPackages]);
  const [pkgOpen, setPkgOpen] = useState(false);
  const [pkgEditId, setPkgEditId] = useState<string | null>(null);
  const [pkgError, setPkgError] = useState("");
  const emptyPkgForm = { name: "", type: "sessions", value: "", price: "" };
  const [pkgForm, setPkgForm] = useState(emptyPkgForm);
  const updatePkg = (key: keyof typeof pkgForm) => (e: { target: { value: string } }) => {
    let val = e.target.value;
    if (key === "price" || key === "value") {
      const num = val.replace(/\D/g, "");
      val = num ? Number(num).toLocaleString("en-US") : "";
    }
    setPkgForm((f) => ({ ...f, [key]: val }));
  };

  const startEditPkg = (id: string) => {
    const pkg = packages.find(p => p.id === id)!;
    setPkgForm({ name: pkg.name, type: pkg.type, value: pkg.value ? Number(pkg.value).toLocaleString("en-US") : "", price: pkg.price ? Number(pkg.price).toLocaleString("en-US") : "" });
    setPkgEditId(id);
    setPkgOpen(true);
    setPkgError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletePkg = (id: string) => {
    if (window.confirm("Bạn có thật sự muốn xóa gói/thẻ này?")) {
      setPackages((l) => l.filter(p => p.id !== id));
      const idx = masterPackages.findIndex(p => p.id === id);
      if (idx !== -1) masterPackages.splice(idx, 1);
      fbDeleteMasterPackage(id).catch(console.error);
      setNotice("Đã xóa gói/thẻ thành công.");
    }
  };

  const submitPkg = (e: FormEvent) => {
    e.preventDefault();
    const name = pkgForm.name.trim();
    const value = Number(pkgForm.value.replace(/\D/g, ""));
    const price = Number(pkgForm.price.replace(/\D/g, ""));
    
    if (!name || !value || !price) {
      return setPkgError("Vui lòng nhập đầy đủ thông tin: Tên, Giá trị và Giá bán.");
    }
    
    if (masterPackages.some((p) => p.id !== pkgEditId && p.name.toLowerCase() === name.toLowerCase())) {
      return setPkgError("Gói/thẻ này đã có trong danh sách.");
    }

    const newItem = { id: pkgEditId || `PK${Date.now()}`, name, type: pkgForm.type, value, price };
    if (pkgEditId) {
      setPackages(l => l.map(p => p.id === pkgEditId ? newItem : p));
      const idx = masterPackages.findIndex(p => p.id === pkgEditId);
      if (idx !== -1) masterPackages[idx] = newItem as any;
      fbSaveMasterPackage(newItem).catch(console.error);
      setNotice(`Đã cập nhật gói: ${name}.`);
    } else {
      setPackages(l => [...l, newItem]);
      masterPackages.push(newItem as any);
      fbSaveMasterPackage(newItem).catch(console.error);
      setNotice(`Đã thêm gói: ${name}.`);
    }
    setPkgError("");
    setPkgOpen(false);
    setPkgEditId(null);
    setPkgForm(emptyPkgForm);
  };

  // Staff
  const [staff, setStaff] = useState(therapists.map(t => ({ role: "Kỹ thuật viên", phone: "", ...t })));
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffIdx, setStaffIdx] = useState<number | null>(null);
  const [staffError, setStaffError] = useState("");
  const emptyStaff = { id: "", name: "", phone: "", role: roles[0]! };
  const [staffForm, setStaffForm] = useState(emptyStaff);
  const updateStaff = (key: keyof typeof staffForm) => (e: { target: { value: string } }) =>
    setStaffForm((f) => ({ ...f, [key]: e.target.value }));

  const editStaff = (i: number) => {
    const s = staff[i]!;
    setStaffForm({ id: s.id, name: s.name, phone: s.phone, role: s.role });
    setStaffIdx(i);
    setStaffOpen(true);
    setStaffError("");
    setNotice("");
  };

  const deleteStaff = (i: number) => {
    if (window.confirm("Bạn có thật sự muốn xóa?")) {
      const t = staff[i];
      setStaff((l) => l.filter((_, idx) => idx !== i));
      therapists.splice(i, 1);
      fbDeleteTherapist(t.id).catch(console.error);
      setNotice("Đã xóa nhân viên thành công.");
    }
  };

  const submitStaff = (e: FormEvent) => {
    e.preventDefault();
    const name = staffForm.name.trim();
    if (!name) return setStaffError("Vui lòng nhập tên nhân viên.");
    if (staff.some((s, i) => i !== staffIdx && s.name.toLowerCase() === name.toLowerCase()))
      return setStaffError("Nhân viên này đã có trong danh sách.");
    const newStaff = { id: staffForm.id || ("THR_" + Date.now()), name, phone: staffForm.phone.trim(), role: staffForm.role, sessions: staffIdx !== null ? staff[staffIdx].sessions : 0, revenue: staffIdx !== null ? staff[staffIdx].revenue : 0 };
    if (staffIdx !== null) {
      const oldName = staff[staffIdx].name;
      setStaff((l) => l.map((s, i) => (i === staffIdx ? newStaff : s)));
      therapists[staffIdx] = newStaff as any;
      
      fbSaveTherapist(newStaff).catch(console.error);
      setNotice(`Đã cập nhật nhân viên ${name}.`);
    } else {
      setStaff((l) => [...l, newStaff]);
      therapists.push(newStaff as any);
      fbSaveTherapist(newStaff).catch(console.error);
      setNotice(`Đã thêm nhân viên ${name}.`);
    }
    setStaffError("");
    setStaffOpen(false);
    setStaffIdx(null);
    setStaffForm(emptyStaff);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Dịch vụ, Nhân viên & Gói thẻ</h1>
        <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink/65">
          Quản lý bảng giá dịch vụ, đội ngũ nhân viên và các gói/thẻ liệu trình.
        </p>
      </div>

      <div className="flex gap-6 border-b border-ink/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setActiveTab("services"); setNotice(""); }}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap ${activeTab === "services" ? "border-b-2 border-emerald text-emerald" : "text-ink/50 hover:text-ink"}`}
        >
          Dịch vụ
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("packages"); setNotice(""); }}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap ${activeTab === "packages" ? "border-b-2 border-emerald text-emerald" : "text-ink/50 hover:text-ink"}`}
        >
          Gói & thẻ liệu trình
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("staff"); setNotice(""); }}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap ${activeTab === "staff" ? "border-b-2 border-emerald text-emerald" : "text-ink/50 hover:text-ink"}`}
        >
          Nhân viên
        </button>
      </div>

      {notice && (
        <p role="status" className="rounded-[3px] border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">{notice}</p>
      )}

      {activeTab === "services" && (
        <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6 max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Danh mục dịch vụ</h2>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                type="search"
                placeholder="Tìm dịch vụ..."
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="w-full sm:w-48 rounded-[3px] border border-ink/15 bg-ivory px-3 py-2 text-sm text-ink outline-none transition focus:border-emerald"
              />
              <label className="cursor-pointer rounded-[3px] border border-emerald/50 bg-emerald/10 px-4 py-2.5 text-xs font-semibold text-emerald transition hover:bg-emerald/20 flex items-center justify-center">
                Nhập CSV
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                    let count = 0;
                    for (let i = 1; i < lines.length; i++) {
                      const parts = lines[i].split(',');
                      if (parts.length >= 3) {
                        const name = parts[0].trim();
                        const duration = Number(parts[1].trim());
                        const price = Number(parts[2].trim());
                        if (name && duration && price) {
                          const item = { name, duration: `${duration} phút`, price };
                          setServices(l => {
                            if (!l.find(s => s.name === name)) return [...l, item];
                            return l;
                          });
                          if (!serviceOptions.find(s => s.name === name)) {
                            serviceOptions.push(item);
                            fbSaveService(item).catch(console.error);
                            count++;
                          }
                        }
                      }
                    }
                    setNotice(`Đã nhập thành công ${count} dịch vụ.`);
                    e.target.value = '';
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => { setOpen((v) => !v); setEditIdx(null); setForm(emptyService); setError(""); setNotice(""); }}
                className="rounded-[3px] bg-emerald px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
              >
                {open ? "Đóng" : "Thêm dịch vụ"}
              </button>
            </div>
          </div>
          {open && (
            <form onSubmit={submit} className="mb-4 border-y border-ink/10 py-4">
              <p className="mb-3 text-sm font-semibold text-ink">{editIdx !== null ? "Sửa dịch vụ" : "Dịch vụ mới"}</p>
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                <label className="space-y-1.5 text-xs font-semibold text-ink/60">
                  Tên dịch vụ
                  <input className={inputClass} value={form.name} onChange={update("name")} placeholder="VD: Massage cổ vai gáy" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-ink/60">
                  Thời lượng (phút)
                  <input className={inputClass} value={form.duration} onChange={update("duration")} inputMode="numeric" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-ink/60">
                  Giá (₫)
                  <input className={inputClass} value={form.price} onChange={update("price")} inputMode="numeric" placeholder="500000" />
                </label>
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => { setOpen(false); setEditIdx(null); }} className="rounded-[3px] border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink/70">Huỷ</button>
                <button type="submit" className="rounded-[3px] bg-emerald px-5 py-2.5 text-xs font-semibold text-ivory hover:bg-emerald-soft">Lưu dịch vụ</button>
              </div>
            </form>
          )}
          <ul className="divide-y divide-ink/10">
            {services.map((item, i) => ({item, i})).filter(({item}) => !searchService || item.name.toLowerCase().includes(searchService.toLowerCase())).map(({item, i}) => (
              <li key={item.name} className="flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink/50">{item.duration}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-emerald">{formatVnd(item.price)}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => editService(i)} className={editBtn}>
                    <Pencil className="size-3" /> Sửa
                  </button>
                  <button type="button" onClick={() => deleteService(i)} className="inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500">
                    <Trash2 className="size-3" /> Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === "packages" && (
        <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-2xl text-ink">Gói & Thẻ liệu trình</h2>
              <p className="mt-1 text-sm text-ink/65">Quản lý thẻ liệu trình trừ dần theo số lượt hoặc trừ tiền.</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                type="search"
                placeholder="Tìm gói/thẻ..."
                value={searchPackage}
                onChange={(e) => setSearchPackage(e.target.value)}
                className="w-full sm:w-48 rounded-[3px] border border-ink/15 bg-ivory px-3 py-2 text-sm text-ink outline-none transition focus:border-emerald"
              />
              <label className="cursor-pointer rounded-[3px] border border-emerald/50 bg-emerald/10 px-4 py-2.5 text-xs font-semibold text-emerald transition hover:bg-emerald/20 flex items-center justify-center">
                Nhập CSV
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                    let count = 0;
                    for (let i = 1; i < lines.length; i++) {
                      const parts = lines[i].split(',');
                      if (parts.length >= 4) {
                        const name = parts[0].trim();
                        const type = parts[1].trim() === 'sessions' ? 'sessions' : 'balance';
                        const value = Number(parts[2].trim());
                        const price = Number(parts[3].trim());
                        if (name && value && price) {
                          const newItem = { id: `PK${Date.now()}${i}`, name, type, value, price };
                          setPackages(l => {
                            if (!l.find(p => p.name === name)) return [...l, newItem];
                            return l;
                          });
                          if (!masterPackages.find(p => p.name === name)) {
                            masterPackages.push(newItem as any);
                            fbSaveMasterPackage(newItem).catch(console.error);
                            count++;
                          }
                        }
                      }
                    }
                    setNotice(`Đã nhập thành công ${count} gói/thẻ.`);
                    e.target.value = '';
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => { setPkgOpen((v) => !v); setPkgEditId(null); setPkgForm(emptyPkgForm); setPkgError(""); setNotice(""); }}
                className="rounded-[3px] bg-emerald px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
              >
                {pkgOpen ? "Đóng" : "Thêm Gói/Thẻ Mới"}
              </button>
            </div>
          </div>

          {pkgOpen && (
            <form onSubmit={submitPkg} className="rounded-[3px] border border-ink/10 bg-ivory/60 p-5 mb-5">
              <p className="mb-3 text-sm font-semibold text-ink">{pkgEditId ? "Sửa Gói/Thẻ" : "Thêm Gói/Thẻ Mới"}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="space-y-1.5 text-xs font-semibold text-ink/60">
                  Tên Gói / Thẻ
                  <input className={inputClass} value={pkgForm.name} onChange={updatePkg("name")} placeholder="VD: Thẻ trị mụn 5 buổi" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-ink/60">
                  Hình Thức
                  <select className={inputClass} value={pkgForm.type} onChange={updatePkg("type")}>
                    <option value="sessions">Theo số lượt</option>
                    <option value="balance">Theo số dư</option>
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-ink/60">
                  Giá Trị {pkgForm.type === "sessions" ? "(Số buổi)" : "(VNĐ)"}
                  <input className={inputClass} value={pkgForm.value} onChange={updatePkg("value")} inputMode="numeric" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-ink/60">
                  Giá Bán (VNĐ)
                  <input className={inputClass} value={pkgForm.price} onChange={updatePkg("price")} inputMode="numeric" />
                </label>
              </div>
              {pkgError && <p role="alert" className="mt-4 text-sm text-destructive">{pkgError}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => { setPkgOpen(false); setPkgEditId(null); }} className="rounded-[3px] border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink/70">Huỷ</button>
                <button type="submit" className="rounded-[3px] bg-emerald px-5 py-2.5 text-xs font-semibold text-ivory hover:bg-emerald-soft">Lưu Thông Tin</button>
              </div>
            </form>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {packages.filter(item => !searchPackage || item.name.toLowerCase().includes(searchPackage.toLowerCase())).map((item) => (
              <div key={item.id} className="rounded-[3px] border border-ink/10 bg-ivory/60 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg text-ink">{item.name}</p>
                    <CreditCard className="size-4 shrink-0 text-emerald/60" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-ink/10 pt-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">Loại</p>
                      <p className="mt-0.5 text-sm font-medium text-ink">{item.type === "sessions" ? "Trừ Lượt" : "Trừ Tiền"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">Giá Trị</p>
                      <p className="mt-0.5 text-sm font-semibold text-emerald">{item.type === "sessions" ? `${item.value} buổi` : formatVnd(item.value)}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                     <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">Giá Bán</p>
                     <p className="mt-0.5 text-sm font-medium text-ink">{formatVnd(item.price)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => startEditPkg(item.id)} className={editBtn}>
                    <Pencil className="size-3" /> Sửa
                  </button>
                  <button type="button" onClick={() => deletePkg(item.id)} className="inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500">
                    <Trash2 className="size-3" /> Xóa
                  </button>
                </div>
              </div>
            ))}
            {packages.length === 0 && <p className="col-span-full py-4 text-sm text-ink/50">Chưa có gói/thẻ nào.</p>}
          </div>
        </section>
      )}

      {activeTab === "staff" && (
        <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6 max-w-4xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Nhân viên</h2>
            <button
              type="button"
              onClick={() => { setStaffOpen((v) => !v); setStaffIdx(null); setStaffForm(emptyStaff); setStaffError(""); setNotice(""); }}
              className="rounded-[3px] bg-emerald px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
            >
              {staffOpen ? "Đóng" : "Thêm nhân viên"}
            </button>
          </div>
          {staffOpen && (
            <form onSubmit={submitStaff} className="mt-4 space-y-3 border-y border-ink/10 py-4">
              <p className="text-sm font-semibold text-ink">{staffIdx !== null ? "Sửa nhân viên" : "Nhân viên mới"}</p>
              <label className="block space-y-1.5 text-xs font-semibold text-ink/60">
                Họ tên
                <input className={inputClass} value={staffForm.name} onChange={updateStaff("name")} placeholder="VD: KTV Hồng Nhung" />
              </label>
              <label className="block space-y-1.5 text-xs font-semibold text-ink/60">
                Số điện thoại
                <input className={inputClass} value={staffForm.phone} onChange={updateStaff("phone")} inputMode="tel" placeholder="09xx xxx xxx" />
              </label>
              <label className="block space-y-1.5 text-xs font-semibold text-ink/60">
                Vai trò
                <select className={inputClass} value={staffForm.role} onChange={updateStaff("role")}>
                  {roles.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
              {staffError && <p role="alert" className="text-sm text-destructive">{staffError}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setStaffOpen(false); setStaffIdx(null); }} className="rounded-[3px] border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink/70">Huỷ</button>
                <button type="submit" className="rounded-[3px] bg-emerald px-5 py-2.5 text-xs font-semibold text-ivory hover:bg-emerald-soft">Lưu nhân viên</button>
              </div>
            </form>
          )}
          <ul className="mt-4 space-y-3">
            {staff.map((item, i) => (
              <li key={item.name} className="flex items-center gap-3 rounded-[3px] border border-ink/10 bg-ivory/60 p-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-champagne/60 bg-champagne/15 font-display text-base italic text-emerald">
                  {item.name.split(" ").slice(-1)[0]?.[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{item.name}</p>
                  <p className="truncate text-xs text-ink/50">
                    {item.role}{item.phone ? ` - ${item.phone}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => editStaff(i)} className={editBtn}>
                    <Pencil className="size-3" /> Sửa
                  </button>
                  <button type="button" onClick={() => deleteStaff(i)} className="inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500">
                    <Trash2 className="size-3" /> Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}
