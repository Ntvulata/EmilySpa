import { createFileRoute } from "@tanstack/react-router";
import { History, ShoppingCart, Scissors, Pencil, Trash2, ChevronDown, Check } from "lucide-react";
import { formatVnd, packageHistory, masterPackages, initialCustomers } from "@/lib/spa-data";
import { fbSavePackageHistory, fbDeletePackageHistory } from "@/lib/firebase";
import { useState, useRef, useEffect, type FormEvent } from "react";

export const Route = createFileRoute("/dashboard/packages-history")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      action: search.action as string | undefined,
    }
  },
  head: () => ({
    meta: [
      { title: "Lịch sử Gói/Thẻ | Emily Spa" },
    ],
  }),
  component: PackagesHistoryPage,
});

function SearchableSelect({ options, value, onChange, placeholder }: { options: {value: string, label: string}[], value: string, onChange: (v: string) => void, placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = options.find(o => o.value === value)?.label || "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="w-full flex items-center justify-between rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm text-ink outline-none transition focus:border-emerald"
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown className="size-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-[3px] border border-ink/10 bg-ivory shadow-lg overflow-hidden flex flex-col max-h-60">
          <div className="p-2 border-b border-ink/10">
            <input
              type="text"
              autoFocus
              className="w-full rounded-[3px] bg-ivory-deep/50 px-3 py-1.5 text-sm outline-none"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto p-1">
            {filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className="w-full flex items-center justify-between rounded-[3px] px-3 py-2 text-sm text-left hover:bg-emerald/10 hover:text-emerald"
              >
                {o.label}
                {value === o.value && <Check className="size-3.5 text-emerald" />}
              </button>
            ))}
            {filtered.length === 0 && <div className="p-3 text-sm text-ink/50 text-center">Không tìm thấy</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function PackagesHistoryPage() {
  const { action } = Route.useSearch();
  const [filter, setFilter] = useState<"all" | "sell" | "deduct">("all");
  const [open, setOpen] = useState(action === "new");
  const [editId, setEditId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    customer: "",
    packageId: "",
    valueChange: "",
    pricePaid: "",
    note: ""
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [tick, setTick] = useState(0);
  const [page, setPage] = useState(1);

  const getPackageName = (id: string) => masterPackages.find(p => p.id === id)?.name || id;
  const getFormatValue = (pkgId: string, value: number) => {
    const p = masterPackages.find(x => x.id === pkgId);
    if (!p) return value;
    return p.type === 'sessions' ? `${value > 0 ? '+' : ''}${value} buổi` : `${value > 0 ? '+' : ''}${formatVnd(value)}`;
  };

  const filteredRows = packageHistory.filter(h => filter === "all" || h.type === filter).sort((a, b) => b.id.localeCompare(a.id));
  const ITEMS_PER_PAGE = 50;
  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;
  const rows = filteredRows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const customerOptions = initialCustomers.map(c => ({ value: c.name, label: `${c.name} - ${c.phone}` }));
  const packageOptions = masterPackages.map(p => ({ value: p.id, label: `${p.name} (${p.type === "sessions" ? p.value + " buổi" : formatVnd(p.value)})` }));

  const startNew = () => {
    setForm({ 
      date: new Date().toISOString().split("T")[0], 
      customer: "", 
      packageId: "", 
      valueChange: "", 
      pricePaid: "",
      note: "" 
    });
    setEditId(null);
    setOpen(true);
    setError("");
    setNotice("");
  };

  const startEdit = (id: string) => {
    const item = packageHistory.find(x => x.id === id);
    if (!item || item.type !== "sell") return;
    setForm({
      date: item.date,
      customer: item.customer,
      packageId: item.packageId,
      valueChange: item.valueChange ? Number(item.valueChange).toLocaleString("en-US") : "",
      pricePaid: item.pricePaid !== undefined ? Number(item.pricePaid).toLocaleString("en-US") : "",
      note: item.note
    });
    setEditId(id);
    setOpen(true);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch sử này?")) {
      const idx = packageHistory.findIndex(h => h.id === id);
      if (idx !== -1) packageHistory.splice(idx, 1);
      setTick(t => t + 1);
      setNotice("Đã xóa lịch sử.");
      
      try {
        await fbDeletePackageHistory(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.date) return setError("Vui lòng chọn ngày mua.");
    if (!form.customerId) return setError("Vui lòng chọn khách hàng.");
    if (!form.packageId) return setError("Vui lòng chọn gói/thẻ.");
    
    const val = Number(form.valueChange.replace(/\D/g, ""));
    if (!val) return setError("Vui lòng nhập giá trị thẻ hợp lệ.");

    const price = Number(form.pricePaid.replace(/\D/g, ""));
    if (isNaN(price)) return setError("Vui lòng nhập số tiền thanh toán hợp lệ.");

    let recordToSave;

    if (editId) {
      const idx = packageHistory.findIndex(h => h.id === editId);
      if (idx !== -1) {
        recordToSave = {
          ...packageHistory[idx],
          date: form.date,
          customer: form.customerId,
          packageId: form.packageId,
          valueChange: val,
          pricePaid: price,
          note: form.note
        };
        packageHistory[idx] = recordToSave;
      }
      setNotice("Đã cập nhật lịch sử bán.");
    } else {
      const nextId = "HT-" + Date.now();
      recordToSave = {
        id: nextId,
        date: form.date,
        type: "sell" as const,
        customer: form.customerId,
        packageId: form.packageId,
        valueChange: val,
        pricePaid: price,
        note: form.note || "Mua mới/Nạp thêm"
      };
      packageHistory.push(recordToSave);
      setNotice("Đã tạo mới lịch sử bán.");
    }

    setTick(t => t + 1);
    setOpen(false);

    if (recordToSave) {
      try {
        await fbSavePackageHistory(recordToSave);
      } catch (err) {
        console.error(err);
        setError("Lỗi khi lưu lên Cloud.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Lịch sử Gói/Thẻ</h1>
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink/65">
            Theo dõi lịch sử bán thẻ liệu trình và lịch sử trừ thẻ của khách hàng.
          </p>
        </div>
        <button
          type="button"
          onClick={() => open ? setOpen(false) : startNew()}
          className="rounded-[3px] bg-emerald px-5 py-3 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
        >
          {open ? "Đóng biểu mẫu" : "Bán Gói/Thẻ Mới"}
        </button>
      </div>

      {notice && (
        <p role="status" className="rounded-[3px] border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">{notice}</p>
      )}

      {open && (
        <form onSubmit={submit} className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
          <h2 className="font-display text-2xl text-ink">{editId ? "Sửa lịch sử bán" : "Bán Gói/Thẻ Mới"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            
            <label className="space-y-1.5 text-xs font-semibold text-ink/60">
              Ngày mua
              <input
                type="date"
                className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none transition focus:border-emerald"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink/60">Khách Hàng</label>
              <SearchableSelect
                options={customerOptions}
                value={form.customerId}
                onChange={(v) => { setForm({ ...form, customer: v }); setError(""); }}
                placeholder="-- Chọn khách hàng --"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink/60">Gói cần mua</label>
              <SearchableSelect
                options={packageOptions}
                value={form.packageId}
                onChange={(v) => {
                  const master = masterPackages.find(p => p.id === v);
                  setForm({ 
                    ...form, 
                    packageId: v, 
                    valueChange: master ? Number(master.value).toLocaleString("en-US") : "",
                    pricePaid: master ? Number(master.price).toLocaleString("en-US") : ""
                  });
                  setError("");
                }}
                placeholder="-- Chọn gói/thẻ --"
              />
            </div>

            <label className="space-y-1.5 text-xs font-semibold text-ink/60">
              Giá trị cấp cho khách (Số buổi / Số tiền)
              <input
                className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none transition focus:border-emerald"
                value={form.valueChange}
                onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); setForm({ ...form, valueChange: raw ? Number(raw).toLocaleString("en-US") : "" }); }}
                inputMode="numeric"
                placeholder="VD: 5"
              />
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-ink/60">
              Số tiền thanh toán (VNĐ)
              <input
                className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none transition focus:border-emerald"
                value={form.pricePaid}
                onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); setForm({ ...form, pricePaid: raw ? Number(raw).toLocaleString("en-US") : "" }); }}
                inputMode="numeric"
                placeholder="Số tiền khách trả..."
              />
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-ink/60">
              Ghi chú
              <input
                className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none transition focus:border-emerald"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="VD: Khách hàng thân thiết mua mới..."
              />
            </label>
          </div>
          
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          <div className="mt-5 flex items-center justify-between">
              {editId ? (
                <button type="button" onClick={() => { deleteItem(editId); setOpen(false); }} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-5 py-2.5 text-xs font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500">
                  <Trash2 className="size-4" /> Xóa
                </button>
              ) : (
                <div />
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-[3px] border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink/70">Huỷ</button>
                <button type="submit" className="rounded-[3px] bg-emerald px-5 py-2.5 text-xs font-semibold text-ivory hover:bg-emerald-soft">Lưu lại</button>
              </div>
            </div>
        </form>
      )}

      <div className="flex gap-2">
        <button onClick={() => { setFilter("all"); setPage(1); }} className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] rounded-[3px] border transition ${filter === "all" ? "bg-emerald/10 border-emerald text-emerald" : "border-ink/15 text-ink/60 hover:text-emerald"}`}>Tất cả</button>
        <button onClick={() => { setFilter("sell"); setPage(1); }} className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] rounded-[3px] border transition ${filter === "sell" ? "bg-emerald/10 border-emerald text-emerald" : "border-ink/15 text-ink/60 hover:text-emerald"}`}>Lịch sử bán</button>
        <button onClick={() => { setFilter("deduct"); setPage(1); }} className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] rounded-[3px] border transition ${filter === "deduct" ? "bg-emerald/10 border-emerald text-emerald" : "border-ink/15 text-ink/60 hover:text-emerald"}`}>Lịch sử trừ</button>
      </div>

      <div className="overflow-x-auto rounded-[3px] border border-ink/10 bg-ivory-deep/30">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[0.16em] text-ink/50">
              <th className="px-4 py-3 font-semibold">Mã HĐ</th>
              <th className="px-4 py-3 font-semibold">Ngày</th>
              <th className="px-4 py-3 font-semibold">Khách hàng</th>
              <th className="px-4 py-3 font-semibold">Loại</th>
              <th className="px-4 py-3 font-semibold">Gói/Thẻ</th>
              <th className="px-4 py-3 font-semibold text-right">Giá trị thẻ</th>
              <th className="px-4 py-3 font-semibold text-right">Thanh toán</th>
              <th className="px-4 py-3 font-semibold">Ghi chú</th>
              <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10 text-sm">
            {rows.map(item => (
              <tr key={item.id} className="transition hover:bg-ivory/60">
                <td className="px-4 py-3.5 font-medium text-ink/70">{item.id}</td>
                <td className="px-4 py-3.5 text-ink/60">{item.date}</td>
                <td className="px-4 py-3.5 font-semibold text-ink">{initialCustomers.find(c => c.id === item.customerId)?.name || "Unknown"}</td>
                <td className="px-4 py-3.5">
                  {item.type === "sell" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald bg-emerald/10 px-2 py-1 rounded-[2px]"><ShoppingCart className="size-3" /> BÁN THẺ</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-champagne bg-champagne/10 px-2 py-1 rounded-[2px]"><Scissors className="size-3" /> TRỪ THẺ</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-ink/75">{getPackageName(item.packageId)}</td>
                <td className={`px-4 py-3.5 font-semibold text-right ${item.type === "sell" ? "text-emerald" : "text-champagne"}`}>{getFormatValue(item.packageId, item.valueChange)}</td>
                <td className="px-4 py-3.5 font-semibold text-right text-ink/80">
                  {item.pricePaid !== undefined ? formatVnd(item.pricePaid) : "-"}
                </td>
                <td className="px-4 py-3.5 text-ink/50 text-xs">{item.note}</td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  {item.type === "sell" ? (
                    <>
                      <button type="button" onClick={() => startEdit(item.id)} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-emerald/40 hover:text-emerald">
                        <Pencil className="size-3" /> Sửa
                      </button>
                      
                    </>
                  ) : (
                    <span className="text-[10px] text-ink/40 uppercase">Sửa ở Lịch hẹn</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink/50">Chưa có dữ liệu.</p>}
      </div>
    </div>
  );
}

