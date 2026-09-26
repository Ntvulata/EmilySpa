import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { formatVnd, initialCustomers, masterPackages, type Customer, type CustomerPackage, getRemainingPackageValue, packageHistory } from "@/lib/spa-data";
import { fbSaveCustomer, fbDeleteCustomer } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/customers")({
  head: () => ({
    meta: [{ title: "Khách hàng | Emily Spa" }],
  }),
  component: CustomersPage,
});

const tiers = ["Mới", "Đồng", "Bạc", "Vàng", "Kim cương"];
const inputClass = "w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none transition focus:border-emerald";

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const [form, setForm] = useState({ id: "", name: "", phone: "", tier: "Mới" });
  const [activePackages, setActivePackages] = useState<CustomerPackage[]>([]);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setError("");
  };

  const startEdit = (idx: number) => {
    const c = customers[idx];
    setForm({ name: c.name, phone: c.phone, tier: c.tier });
    setActivePackages([...c.activePackages]);
    setEditIdx(idx);
    setOpen(true);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return setError("Vui lòng điền đủ tên và số điện thoại.");
    
    let newCustomer: Customer;
    let oldPhone = null;

    if (editIdx !== null) {
      const updated = [...customers];
      oldPhone = updated[editIdx].phone;
      newCustomer = { ...updated[editIdx], ...form, activePackages };
      updated[editIdx] = newCustomer;
      setCustomers(updated);
      setNotice(`Đã cập nhật thông tin cho ${form.name.trim()}.`);
    } else {
      newCustomer = { ...form, visits: 0, activePackages };
      setCustomers([...customers, newCustomer]);
      setNotice(`Đã thêm khách hàng mới: ${form.name.trim()}.`);
    }

    // Save to Firebase
    try {
      if (oldPhone && oldPhone !== newCustomer.phone) {
        await fbDeleteCustomer(oldPhone);
      }
      await fbSaveCustomer(newCustomer);
    } catch (err) {
      console.error(err);
      setError("Có lỗi khi lưu lên Cloud.");
    }
    
    setOpen(false);
    setEditIdx(null);
  };

  const deleteCustomer = async (idx: number) => {
    if (window.confirm("Xóa khách hàng này?")) {
      const custToDelete = customers[idx];
      setCustomers((l) => l.filter((_, i) => i !== idx));
      setNotice("Đã xóa khách hàng.");
      
      try {
        await fbDeleteCustomer(custToDelete.phone);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getActivePackages = (customerId: string, legacyPackages: CustomerPackage[]) => {
    const pkgIds = new Set(legacyPackages.map(p => p.packageId));
    packageHistory
      .filter(h => h.customerId === customerId)
      .forEach(h => pkgIds.add(h.packageId));
    
    const active: { packageId: string, remaining: number }[] = [];
    pkgIds.forEach(id => {
      const rem = getRemainingPackageValue(customerName, id);
      if (rem > 0) active.push({ packageId: id, remaining: rem });
    });
    return active;
  };

  const ITEMS_PER_PAGE = 50;
  const filteredCustomers = customers.map((item, i) => ({item, i})).filter(({item}) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.phone.includes(search));
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;
  const paginatedCustomers = filteredCustomers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Khách Hàng</h1>
          <p className="mt-2 text-sm text-ink/65">Quản lý hồ sơ, thẻ thành viên và lịch sử dịch vụ.</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer rounded-[3px] border border-emerald/50 bg-emerald/10 px-5 py-3 text-xs font-semibold text-emerald transition hover:bg-emerald/20">
            Nhập file CSV
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                // Skip header (first line)
                let count = 0;
                for (let i = 1; i < lines.length; i++) {
                  const parts = lines[i].split(',');
                  if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const phone = parts[1].trim();
                    if (name && phone) {
                      const newCust = { name, phone, tier: "Mới" };
                      setCustomers(l => {
                        if (!l.find(c => c.phone === phone)) return [...l, newCust];
                        return l;
                      });
                      initialCustomers.push(newCust);
                      fbSaveCustomer(newCust).catch(console.error);
                      count++;
                    }
                  }
                }
                setNotice(`Đã nhập thành công ${count} khách hàng.`);
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (open && editIdx === null) setOpen(false);
              else {
                setForm({ id: "CUST_" + Date.now(), name: "", phone: "", tier: "Mới" });
                setActivePackages([]);
                setEditIdx(null);
                setOpen(true);
              }
            }}
            className="rounded-[3px] bg-emerald px-5 py-3 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
          >
            {open ? "Đóng biểu mẫu" : "Thêm khách hàng"}
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className="rounded-[3px] border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">{notice}</p>
      )}

      <div className="max-w-md relative">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm theo tên hoặc số điện thoại..."
          className="w-full rounded-[3px] border border-ink/15 bg-ivory-deep/50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald"
        />
      </div>

      {open && (
        <form onSubmit={submit} className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
          <h2 className="font-display text-2xl text-ink">{editIdx !== null ? "Sửa thông tin khách" : "Khách hàng mới"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="space-y-1.5 text-xs font-semibold text-ink/60">
              Họ tên
              <input className={inputClass} value={form.name} onChange={update("name")} placeholder="VD: Nguyễn Thu Hà" />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-ink/60">
              Số điện thoại
              <input className={inputClass} value={form.phone} onChange={update("phone")} inputMode="tel" placeholder="09xx xxx xxx" />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-ink/60">
              Hạng thành viên
              <select className={inputClass} value={form.tier} onChange={update("tier")}>
                {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>
          
          <div className="mt-5 border-t border-ink/10 pt-4">
             <div className="flex items-center justify-between mb-3">
               <p className="text-sm font-semibold text-ink">Gói/Thẻ đang sử dụng</p>
             </div>
             {(() => {
                const formActivePackages = getActivePackages(form.id || "", activePackages);
                if (formActivePackages.length > 0) {
  const ITEMS_PER_PAGE = 50;
  const filteredCustomers = customers.map((item, i) => ({item, i})).filter(({item}) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.phone.includes(search));
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;
  const paginatedCustomers = filteredCustomers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
                    <ul className="mb-4 space-y-2">
                      {formActivePackages.map(pkg => {
                        const def = masterPackages.find(m => m.id === pkg.packageId);
                        if (!def) return null;
  const ITEMS_PER_PAGE = 50;
  const filteredCustomers = customers.map((item, i) => ({item, i})).filter(({item}) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.phone.includes(search));
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;
  const paginatedCustomers = filteredCustomers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
                          <li key={pkg.packageId} className="flex items-center justify-between gap-3 bg-ivory p-3 rounded-[3px] border border-ink/10">
                            <div>
                              <p className="text-sm font-medium text-ink">{def.name}</p>
                              <p className="text-xs text-ink/50 mt-0.5">
                                Còn lại: <span className="font-semibold text-emerald">{def.type === "sessions" ? `${pkg.remaining} buổi` : formatVnd(pkg.remaining)}</span>
                              </p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )
                }
                return <p className="text-sm text-ink/50 mb-4 italic">Chưa có gói/thẻ nào.</p>;
             })()}
             
             <p className="text-xs text-ink/60 bg-champagne/10 p-3 rounded-[3px] border border-champagne/20">
                Để bán mới thẻ hoặc nạp thêm tiền/buổi, vui lòng sử dụng chức năng <strong>Mua gói/thẻ</strong> ở menu trên cùng hoặc trang <strong>Lịch sử Gói/Thẻ</strong>.
             </p>
          </div>
          
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => { setOpen(false); setEditIdx(null); }} className="rounded-[3px] border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink/70">Huỷ</button>
            <button type="submit" className="rounded-[3px] bg-emerald px-5 py-2.5 text-xs font-semibold text-ivory hover:bg-emerald-soft">Lưu khách hàng</button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {paginatedCustomers.map(({item, i}) => {
          const validPackages = getActivePackages(item.id, item.activePackages);

  const ITEMS_PER_PAGE = 50;
  const filteredCustomers = customers.map((item, i) => ({item, i})).filter(({item}) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.phone.includes(search));
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;
  const paginatedCustomers = filteredCustomers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
            <div key={item.phone} className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl text-ink">{item.name}</p>
                    <p className="mt-0.5 text-xs text-ink/50">{item.phone}</p>
                  </div>
                  <span className="shrink-0 rounded-[3px] border border-champagne/60 bg-champagne/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/70">
                    {item.tier}
                  </span>
                </div>
                <div className="mt-4 pt-3.5 border-t border-ink/10">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45 mb-2">Lượt đến: {item.visits}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45 mb-1.5">Gói / Thẻ hiện có:</p>
                  {validPackages.length === 0 ? (
                    <p className="text-sm text-ink/50 italic">Không có</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {validPackages.map(pkg => {
                        const def = masterPackages.find(m => m.id === pkg.packageId);
                        if (!def) return null;
  const ITEMS_PER_PAGE = 50;
  const filteredCustomers = customers.map((item, i) => ({item, i})).filter(({item}) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.phone.includes(search));
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;
  const paginatedCustomers = filteredCustomers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
                          <li key={pkg.packageId} className="flex justify-between items-center text-sm border-b border-ink/5 pb-1 last:border-0 last:pb-0">
                            <span className="text-ink truncate pr-2" title={def.name}>{def.name}</span>
                            <span className="font-semibold text-emerald shrink-0">
                              {def.type === "sessions" ? `${pkg.remaining} buổi` : formatVnd(pkg.remaining)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => startEdit(i)} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-emerald/40 hover:text-emerald">
                  <Pencil className="size-3" /> Sửa
                </button>
                <button type="button" onClick={() => deleteCustomer(i)} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500">
                  <Trash2 className="size-3" /> Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

