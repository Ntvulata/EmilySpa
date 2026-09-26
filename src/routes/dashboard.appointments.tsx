import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, type FormEvent, useEffect, useRef } from "react";
import { List, TableProperties, Pencil, Trash2, Check, ChevronDown, ChevronLeft, ChevronRight, Plus, Camera } from "lucide-react";
import { formatVnd, appointments as initialAppointments, initialCustomers, serviceOptions, masterPackages, type Appointment, type AppointmentStatus, getRemainingPackageValue, packageHistory, therapists as masterTherapists } from "@/lib/spa-data";
import { fbSaveAppointment, fbSaveAppointmentAndHistory, fbDeleteAppointment } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/appointments")({
  head: () => ({
    meta: [
      { title: "Lịch hẹn Spa | Emily Spa" },
    ],
  }),
  component: AppointmentsPage,
});

const statusClass: Record<AppointmentStatus, string> = {
  cho: "border-ink/15 bg-ivory text-ink/70",
  dang: "border-champagne/40 bg-champagne/10 text-champagne",
  xong: "border-emerald/40 bg-emerald/10 text-emerald",
};

const filters = [
  { key: "all", label: "Tất cả" },
  { key: "cho", label: "Chờ tiếp đón" },
  { key: "dang", label: "Đang chăm sóc" },
  { key: "xong", label: "Hoàn thành" },
  { key: "huy", label: "Hủy" },
];

const inputClass = "w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm font-normal text-ink shadow-sm outline-none transition-all duration-200 placeholder:text-ink/35 hover:border-ink/25 focus:border-emerald focus:ring-2 focus:ring-emerald/20 focus:shadow-md";

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

function getNext15MinTime(addOffset = 0) {
  const d = new Date();
  const mins = d.getMinutes();
  const remainder = mins % 15;
  const addMins = remainder === 0 ? 0 : 15 - remainder;
  d.setMinutes(mins + addMins + addOffset);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function AppointmentsPage() {

  const handleCapture = async () => {
    setIsCapturing(true);
    setTimeout(async () => {
      const el = document.getElementById('grid-container');
      if (!el) { setIsCapturing(false); return; }
      try {
        const htmlToImage = await import('html-to-image');
        const dataUrl = await htmlToImage.toPng(el, { backgroundColor: '#FAFAF9', pixelRatio: 2 });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'lich-hen-spa.png';
        a.click();
      } catch (e: any) {
        console.error(e);
        alert('Lỗi chụp ảnh: ' + (e.message || 'Không xác định'));
      } finally {
        setIsCapturing(false);
      }
    }, 150); // wait for render
  };


  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000); // 1 min update
    return () => clearInterval(timer);
  }, []);

  const getGridCardStyle = (appt: any) => {
    const now = new Date();
    const startTime = new Date(`${appt.date}T${appt.time}:00`);
    let endTime = new Date(startTime);
    if (appt.endTime) {
      endTime = new Date(`${appt.date}T${appt.endTime}:00`);
    } else {
      endTime.setMinutes(endTime.getMinutes() + 60);
    }
    
    const minsToStart = (startTime.getTime() - now.getTime()) / 60000;
    const minsToEnd = (endTime.getTime() - now.getTime()) / 60000;

    if (appt.status === 'xong') return { backgroundColor: '#D1FAE5', borderColor: '#34D399', color: '#064E3B' }; // Emerald
    if (appt.status === 'huy') return { backgroundColor: '#FEE2E2', borderColor: '#F87171', color: '#7F1D1D' }; // Red
    if (appt.status === 'cho') {
      if (minsToStart < 0) return { backgroundColor: '#FEF08A', borderColor: '#FACC15', color: '#713F12' }; // Yellow 200
      if (minsToStart <= 10) return { backgroundColor: '#FEF9C3', borderColor: '#FDE047', color: '#713F12' }; // Yellow 100
    }
    if (appt.status === 'dang') {
      if (minsToEnd < 0) return { backgroundColor: '#E0E7FF', borderColor: '#818CF8', color: '#312E81' }; // Indigo
      return { backgroundColor: '#CFFAFE', borderColor: '#22D3EE', color: '#164E63' }; // Cyan
    }
    return {};
  };

  const d = new Date();
  d.setDate(d.getDate() - 6);
  const [fromDate, setFromDate] = useState(d.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  useEffect(() => {
    if (viewMode === "grid") {
      const now = new Date();
      // Ensure we are viewing today's schedule before auto-scrolling
      const todayStr = now.toISOString().split("T")[0];
      if (fromDate <= todayStr && toDate >= todayStr) {
        const currentMins = now.getHours() * 60 + now.getMinutes() - 8 * 60;
        if (currentMins >= 0 && currentMins <= 16 * 60) {
          const rowIndex = Math.floor(currentMins / 15);
          setTimeout(() => {
            const container = document.getElementById('grid-scroll-container');
            const el = document.getElementById('time-row-' + rowIndex);
            if (container && el) {
              const offset = el.offsetTop - container.clientHeight / 2;
              container.scrollTo({ top: offset, behavior: 'smooth' });
            }
          }, 100); // short delay to ensure DOM is rendered
        }
      }
    }
  }, [viewMode, fromDate, toDate]);
    const [isCapturing, setIsCapturing] = useState(false);
  const [open, setOpen] = useState(false);
  const [appts, setAppts] = useState(initialAppointments);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    date: string;
    time: string;
      endTime: string;
    customerId: string;
    serviceIds: string[];
    therapistId: string;
    status: AppointmentStatus;
    packageUsed: string;
    price: string;
    sessionsDeducted: string;
    balanceDeducted: string;
  }>({
    date: new Date().toISOString().split("T")[0],
    time: getNext15MinTime(),
      endTime: getNext15MinTime(60),
    customerId: "",
    serviceIds: serviceOptions.length > 0 ? [serviceOptions[0].id] : [""],
    therapistId: masterTherapists[0].id,
    status: "cho",
    packageUsed: "",
    price: "",
    sessionsDeducted: "1",
    balanceDeducted: ""
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const timeSlots = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30", "19:00"];
  const therapistNames = masterTherapists
    .filter((t: any) => !t.role || t.role === "Kỹ thuật viên")
    .map(t => t.name);

  const getPackageName = (id?: string) => {
    if (!id) return "Không dùng thẻ";
    const p = masterPackages.find(x => x.id === id);
    return p ? p.name : id;
  };

  const getPackageType = (id?: string) => {
    if (!id) return "none";
    const p = masterPackages.find(x => x.id === id);
    return p ? p.type : "none";
  };

  const rows = useMemo(() => {
    return appts.filter((item) => {
      const matchDate = viewMode === "grid" 
        ? item.date === toDate 
        : item.date >= fromDate && item.date <= toDate;
      let matchStatus = statusFilter === "all" || item.status === statusFilter;
        if (viewMode === "grid" && item.status === "huy") matchStatus = false;
        return matchDate && matchStatus;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appts, fromDate, toDate, statusFilter, viewMode]);

  const therapists = useMemo(() => {
    return therapistNames.map(name => ({
      name,
      sessions: rows.filter(r => r.therapistId === name || r.therapist === name).length
    }));
  }, [rows]);

  const customerOptions = initialCustomers.map(c => ({ value: c.id, label: `${c.name} - ${c.phone}` }));

  // Khách hàng hiện tại đang chọn để xem họ có thẻ gì
  const customerPackages = useMemo(() => {
    if (!form.customerId) return [];
    
    // Thu thập tất cả các gói từ history
    const pkgIds = new Set<string>();
    packageHistory
      .filter(h => h.customer === form.customerId)
      .forEach(h => pkgIds.add(h.packageId));
    
    // Fallback lấy từ initialCustomers nếu cần (nếu chưa có trong history)
    const c = initialCustomers.find(x => x.id === form.customerId);
    if (c) c.activePackages.forEach(p => pkgIds.add(p.id));

    const active: { id: string, name: string, type: 'sessions' | 'balance', remaining: number }[] = [];
    pkgIds.forEach(id => {
      const rem = getRemainingPackageValue(form.customerId, id);
      if (rem > 0) {
        const master = masterPackages.find(m => m.id === id);
        if (master) {
          active.push({ id, name: master.name, type: master.type, remaining: rem });
        }
      }
    });
    return active;
  }, [form.customerId, appts]); // thêm appts vào dependency để update lại khi có thay đổi trừ thẻ

  const shiftDate = (days: number) => {
    const d = new Date(toDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split("T")[0];
    setToDate(newDate);
    setFromDate(newDate);
  };

  const startNew = () => {
    setForm({
      date: new Date().toISOString().split("T")[0],
      time: getNext15MinTime(),
      endTime: getNext15MinTime(60),
      customerId: "",
      serviceIds: serviceOptions.length > 0 ? [serviceOptions[0].id] : [""],
      therapistId: masterTherapists[0].id,
      status: "cho",
      packageUsed: "",
      price: "",
      sessionsDeducted: "1",
      balanceDeducted: ""
    });
    setEditId(null);
    setOpen(true);
    setError("");
    setNotice("");
  };

  const startEdit = (item: Appointment) => {
    setForm({
      date: item.date,
      time: item.time,
        endTime: item.endTime || item.time,
      customerId: item.customerId,
      serviceIds: [...(item.serviceIds || (item as any).services || [])],
      therapistId: item.therapistId,
      status: item.status,
      packageUsed: item.packageUsed || "",
      price: item.price ? Number(item.price).toLocaleString("en-US") : "",
      sessionsDeducted: item.sessionsDeducted ? String(item.sessionsDeducted) : "1",
      balanceDeducted: item.balanceDeducted ? Number(item.balanceDeducted).toLocaleString("en-US") : ""
    });
    setEditId(item.id);
    setOpen(true);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch hẹn này?")) {
      setAppts((l) => l.filter(x => x.id !== id));
      const idx = initialAppointments.findIndex(x => x.id === id);
      if (idx !== -1) initialAppointments.splice(idx, 1);
      
      // Kèm theo nếu lịch hẹn đã hoàn thành và có trừ thẻ, ta nên báo để xử lý,
      // nhưng xóa cứng thường chỉ dùng cho "Hủy".
      setNotice("Đã xóa lịch hẹn.");
      try {
        await fbDeleteAppointment(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const processPackageDeduction = (apptId: string, customer: string, packageId: string, type: 'sessions' | 'balance', dedSessions: number, dedBalance: number) => {
    const nextId = "HT-" + Date.now();
    const note = `Làm dịch vụ ${apptId}`;
    const valueChange = type === "sessions" ? -dedSessions : -dedBalance;
    
    const record: any = {
      id: nextId,
      date: new Date().toISOString().split("T")[0],
      type: "deduct",
      customer,
      packageId,
      valueChange,
      note,
      appointmentId: apptId
    };
    packageHistory.push(record);
    return record;
  };

  const changeStatus = async (id: string, oldStatus: AppointmentStatus, newStatus: AppointmentStatus) => {
    if (oldStatus === newStatus) return;

    if (oldStatus === "xong" && newStatus !== "xong") {
      alert("Lịch hẹn đã hoàn thành không thể đổi trạng thái nhanh. Vui lòng bấm Sửa để thay đổi và hoàn lại thẻ nếu cần.");
      setAppts(current => [...current]);
      return;
    }

    if (newStatus === "xong") {
      const appt = initialAppointments.find(x => x.id === id);
      if (appt) {
        startEdit({ ...appt, status: "xong" });
        setAppts(current => [...current]); // Reset the dropdown back to original value visually until they save
        setNotice("Vui lòng kiểm tra lại dịch vụ và số tiền thu trước khi hoàn thành lịch hẹn.");
        return;
      }
    }

    let updatedAppt: Appointment | null = null;
    let newRecord: any = null;

    const oldAppt = initialAppointments.find(x => x.id === id);
    if (oldAppt) {
      updatedAppt = { ...oldAppt, status: newStatus };
      
      const isNewlyCompleted = oldStatus !== "xong" && newStatus === "xong";
      if (isNewlyCompleted && updatedAppt.packageUsed) {
        const t = getPackageType(updatedAppt.packageUsed);
        newRecord = processPackageDeduction(
          updatedAppt.id, 
          updatedAppt.customer, 
          updatedAppt.packageUsed, 
          t, 
          updatedAppt.sessionsDeducted || 0, 
          updatedAppt.balanceDeducted || 0
        );
      }
      
      const idx = initialAppointments.findIndex(x => x.id === id);
      if (idx !== -1) initialAppointments[idx] = updatedAppt;
      setAppts([...initialAppointments]);
    }

    if (updatedAppt) {
      try {
        await fbSaveAppointmentAndHistory(updatedAppt, newRecord, null);
      } catch (err) {
        console.error("Lỗi khi lưu đổi trạng thái", err);
      }
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.customerId) return setError("Vui lòng chọn khách hàng.");
    if (!form.endTime || form.endTime <= form.time) return setError("Giờ kết thúc phải sau giờ bắt đầu.");
    
    // Check overlap
    const hasOverlap = appts.some(app => {
      if (app.id === editId || app.status === 'huy' || app.date !== form.date || app.therapistId !== form.therapistId) return false;
      const appEndTime = app.endTime || app.time; // fallback
      return form.time < appEndTime && form.endTime > app.time;
    });
    
    if (hasOverlap) return setError("KTV này đã có lịch hẹn khác trong khoảng thời gian này! Vui lòng chọn giờ hoặc KTV khác.");

      if (form.serviceIds.length === 0) return setError("Vui lòng chọn ít nhất 1 dịch vụ.");
    
    const p = form.price ? Number(form.price.replace(/\D/g, "")) : 0;
    const s = form.sessionsDeducted ? Number(form.sessionsDeducted.replace(/\D/g, "")) : 0;
    const b = form.balanceDeducted ? Number(form.balanceDeducted.replace(/\D/g, "")) : 0;

    const t = getPackageType(form.packageUsed);

    if (form.packageUsed) {
      const rem = getRemainingPackageValue(form.customerId, form.packageUsed);
      if (t === "sessions" && form.status === "xong" && !editId) {
        if (s > rem) return setError(`Thẻ này chỉ còn ${rem} buổi, không đủ để trừ ${s} buổi.`);
      }
      if (t === "balance" && form.status === "xong" && !editId) {
        if (b > rem) return setError(`Thẻ này chỉ còn ${formatVnd(rem)}, không đủ để trừ ${formatVnd(b)}.`);
      }
    }

    let savedAppt: Appointment;
    let newHistoryRecord: any = null;
    let deletedHistoryId: string | null = null;

    if (editId) {
      const oldAppt = initialAppointments.find(x => x.id === editId);
      
      const isRevertingCompleted = oldAppt?.status === "xong" && form.status !== "xong";
      if (isRevertingCompleted && oldAppt?.packageUsed) {
        if (window.confirm(`Bạn có muốn HOÀN LẠI số dư/buổi cho khách không?\nTrạng thái đổi từ 'Hoàn thành' sang '${form.status}'`)) {
          const toDelete = packageHistory.filter(h => h.appointmentId === editId && h.type === "deduct");
          if (toDelete.length > 0) {
            deletedHistoryId = toDelete.map(h => h.id) as any;
            toDelete.forEach(r => {
              const idx = packageHistory.findIndex(h => h.id === r.id);
              if (idx !== -1) packageHistory.splice(idx, 1);
            });
          }
        }
      }

      if (oldAppt) {
        savedAppt = {
          ...oldAppt,
          ...form,
          price: p,
          sessionsDeducted: s,
          balanceDeducted: b
        };

        const isNewlyCompleted = oldAppt.status !== "xong" && form.status === "xong";
        if (isNewlyCompleted && form.packageUsed) {
          newHistoryRecord = processPackageDeduction(
            savedAppt.id, 
            savedAppt.customer, 
            form.packageUsed, 
            t, 
            savedAppt.sessionsDeducted || 0, 
            savedAppt.balanceDeducted || 0
          );
        }

        const idx = initialAppointments.findIndex(x => x.id === editId);
        if (idx !== -1) initialAppointments[idx] = savedAppt;
        setAppts([...initialAppointments]);
        setNotice("Đã cập nhật lịch hẹn.");
      }
    } else {
      const nextId = "LH-" + (initialAppointments.length + 2001);
      savedAppt = {
        id: nextId,
        date: form.date,
        time: form.time,
          endTime: form.endTime,
        customerId: form.customerId,
        services: [...form.serviceIds],
        therapistId: form.therapistId,
        status: form.status,
        packageUsed: form.packageUsed,
        price: p,
        sessionsDeducted: s,
        balanceDeducted: b
      };

      if (form.status === "xong" && form.packageUsed) {
        newHistoryRecord = processPackageDeduction(
          savedAppt.id, 
          savedAppt.customer, 
          form.packageUsed, 
          t, 
          savedAppt.sessionsDeducted || 0, 
          savedAppt.balanceDeducted || 0
        );
      }

      initialAppointments.push(savedAppt);
      setAppts([...initialAppointments]);
      setNotice("Đã thêm lịch hẹn mới.");
    }

    try {
      await fbSaveAppointmentAndHistory(savedAppt!, newHistoryRecord, deletedHistoryId);
    } catch (err) {
      console.error(err);
      setError("Lỗi lưu Cloud.");
    }
    
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl leading-tight text-ink sm:text-3xl">Lịch hẹn Spa</h1>
          <p className="hidden md:block max-w-[52ch] text-xs leading-relaxed text-ink/65 m-0">
            Quản lý lịch hẹn, điều phối nhân viên và theo dõi trạng thái phục vụ khách hàng.
          </p>
        </div>
        <button
          type="button"
          onClick={() => open ? setOpen(false) : startNew()}
          className="rounded-[3px] bg-emerald px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
        >
          {open ? "Đóng biểu mẫu" : "Tạo Lịch Hẹn Mới"}
        </button>
      </div>

      {notice && (
        <p role="status" className="rounded-[3px] border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">{notice}</p>
      )}

      {open && (
        <form onSubmit={submit} className="rounded-xl border border-emerald/20 bg-gradient-to-br from-white via-ivory-deep/40 to-emerald/[0.03] p-5 shadow-lg ring-1 ring-ink/5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-ink/10 pb-4 mb-1">
            <div className="h-8 w-1 rounded-full bg-emerald"></div>
            <h2 className="font-display text-2xl text-ink">{editId ? "✏️ Sửa Lịch Hẹn" : "📅 Tạo Lịch Hẹn Mới"}</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
              Ngày
              <input type="date" className={inputClass} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
                Bắt đầu
                <input type="time" className={inputClass} value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
              </label>
              <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
                Kết thúc
                <input type="time" className={inputClass} value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
              </label>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Khách Hàng</label>
              <SearchableSelect
                options={customerOptions}
                value={form.customerId}
                onChange={(v) => { setForm({ ...form, customerId: v, packageUsed: "" }); setError(""); }}
                placeholder="-- Chọn khách hàng --"
              />
            </div>
            
            {customerPackages.length > 0 && (
              <div className="sm:col-span-2 space-y-1.5 p-3 rounded-[3px] border border-champagne/40 bg-champagne/10">
                <label className="text-xs font-semibold text-ink/80 flex items-center gap-2">
                  <span>Dùng Gói/Thẻ (Khách có {customerPackages.length} thẻ)</span>
                </label>
                <select 
                  className={inputClass}
                  value={form.packageUsed}
                  onChange={e => setForm({...form, packageUsed: e.target.value})}
                >
                  <option value="">-- Không dùng thẻ (Thanh toán trực tiếp) --</option>
                  {customerPackages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Còn {p.type === "balance" ? formatVnd(p.remaining) : `${p.remaining} buổi`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Dịch vụ</span>
              <div className="space-y-2">
                {(form.serviceIds || []).map((svc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                        <SearchableSelect
                          options={serviceOptions.map(s => ({ value: s.id, label: s.name }))}
                          value={svc}
                          onChange={v => {
                            const newS = [...form.serviceIds];
                            newS[i] = v;
                            setForm({...form, serviceIds: newS});
                          }}
                          placeholder="-- Chọn dịch vụ --"
                        />
                      </div>
                      {form.serviceIds.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const newS = form.serviceIds.filter((_, idx) => idx !== i);
                            setForm({...form, serviceIds: newS});
                          }}
                          className="text-ink/40 hover:text-red-500 p-1.5 transition"
                          title="Xóa"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => setForm({...form, serviceIds: [...form.serviceIds, ""]})}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-[3px] border border-emerald/30 bg-emerald/10 px-3 py-1.5 text-[11px] font-semibold text-emerald transition hover:bg-emerald/20"
                >
                  <Plus className="size-3" /> Thêm dịch vụ
                </button>
              </div>
            <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
              Kỹ thuật viên
              <select className={inputClass} value={form.therapistId} onChange={e => setForm({...form, therapistId: e.target.value})}>
                {masterTherapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
              Trạng thái
              <select className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value as AppointmentStatus})}>
                {filters.filter(f => f.key !== "all").map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </label>

            <div className="sm:col-span-2 rounded-lg border border-emerald/20 bg-gradient-to-r from-emerald/[0.04] to-transparent mt-2 p-4">
              <p className="text-sm font-bold mb-3 text-ink flex items-center gap-2">💳 Thanh toán & Trừ thẻ</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {getPackageType(form.packageUsed) === 'sessions' && (
                   <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
                      Số buổi trừ vào thẻ
                      <input className={inputClass} value={form.sessionsDeducted} onChange={e => setForm({...form, sessionsDeducted: e.target.value})} inputMode="numeric" />
                   </label>
                )}
                {getPackageType(form.packageUsed) === 'balance' && (
                   <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
                      Số tiền trừ vào thẻ (VNĐ)
                      <input className={inputClass} value={form.balanceDeducted} onChange={e => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setForm({...form, balanceDeducted: raw ? Number(raw).toLocaleString("en-US") : ""});
                      }} inputMode="numeric" />
                   </label>
                )}
                <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
                   Số tiền thực thu (Thanh toán thêm/dịch vụ ngoài)
                   <input className={inputClass} value={form.price} onChange={e => {
                     const raw = e.target.value.replace(/\D/g, "");
                     setForm({...form, price: raw ? Number(raw).toLocaleString("en-US") : ""});
                   }} inputMode="numeric" placeholder="VNĐ..." />
                </label>
              </div>
            </div>

          </div>
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          <div className="mt-5 flex items-center justify-between">
              {editId && form.status !== 'dang' && form.status !== 'xong' ? (
                <button 
                  type="button" 
                  onClick={() => {
                    deleteItem(editId);
                    setOpen(false);
                  }} 
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5"
                >
                  <Trash2 className="size-4" /> Xóa
                </button>
              ) : (
                <div></div>
              )}
              <div className="flex gap-3">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-ink/15 px-5 py-2.5 text-xs font-semibold text-ink/70 transition-all hover:bg-ink/5 hover:border-ink/25">Huỷ</button>
            <button type="submit" className="rounded-lg bg-emerald px-6 py-2.5 text-xs font-bold text-ivory shadow-md shadow-emerald/25 transition-all hover:bg-emerald-soft hover:shadow-lg hover:shadow-emerald/30 hover:-translate-y-0.5">Lưu lại</button>
          </div>
        </div>
        </form>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-3">
        <div className="flex flex-wrap items-center gap-3">
          {viewMode === "list" ? (
            <>
              <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
                Từ ngày:
                <input type="date" className="rounded-[3px] border border-ink/15 bg-ivory px-3 py-1.5 outline-none transition focus:border-emerald" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
                Đến ngày:
                <input type="date" className="rounded-[3px] border border-ink/15 bg-ivory px-3 py-1.5 outline-none transition focus:border-emerald" value={toDate} onChange={e => setToDate(e.target.value)} />
              </label>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => shiftDate(-1)} className="rounded-[3px] border border-ink/15 bg-ivory p-1.5 text-ink/70 transition hover:bg-emerald/10 hover:text-emerald hover:border-emerald/30">
                <ChevronLeft className="size-4" />
              </button>
              <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
                Ngày xem:
                <input type="date" className="rounded-[3px] border border-ink/15 bg-ivory px-3 py-1.5 outline-none transition focus:border-emerald" value={toDate} onChange={e => { setToDate(e.target.value); setFromDate(e.target.value); }} />
              </label>
              <button type="button" onClick={() => shiftDate(1)} className="rounded-[3px] border border-ink/15 bg-ivory p-1.5 text-ink/70 transition hover:bg-emerald/10 hover:text-emerald hover:border-emerald/30">
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
          <div className="h-6 w-px bg-ink/10 hidden sm:block"></div>
          
          {viewMode === 'grid' && (
            <button type="button" onClick={handleCapture} className="mr-3 inline-flex items-center gap-1.5 rounded-[3px] bg-emerald px-3 py-1.5 text-[11px] font-semibold text-ivory hover:bg-emerald/80 transition">
              <Camera className="size-3.5" /> Chụp Báo Cáo
            </button>
          )}
          <div className="flex rounded-[3px] bg-ink/5 p-0.5">
            {filters.map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`rounded-[2px] px-3 py-1.5 text-[11px] font-semibold transition ${statusFilter === f.key ? "bg-ivory text-emerald shadow-sm" : "text-ink/60 hover:text-ink"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex rounded-[3px] bg-ink/5 p-0.5">
          <button onClick={() => setViewMode("list")} className={`flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-[11px] font-semibold transition ${viewMode === "list" ? "bg-ivory text-emerald shadow-sm" : "text-ink/60 hover:text-ink"}`}>
            <List className="size-3.5" /> Danh sách
          </button>
          <button onClick={() => setViewMode("grid")} className={`flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-[11px] font-semibold transition ${viewMode === "grid" ? "bg-ivory text-emerald shadow-sm" : "text-ink/60 hover:text-ink"}`}>
            <TableProperties className="size-3.5" /> Lưới
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-180px)] rounded-[3px] border border-ink/10 bg-ivory-deep/30">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-ivory-deep/95 shadow-sm backdrop-blur">
              <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[0.16em] text-ink/50">
                <th className="px-4 py-3 font-semibold">Khách Hàng</th>
                <th className="px-4 py-3 font-semibold">Dịch Vụ</th>
                <th className="px-4 py-3 font-semibold">Kỹ Thuật Viên</th>
                <th className="px-4 py-3 font-semibold">Thẻ Áp Dụng</th>
                <th className="px-4 py-3 font-semibold text-right">Chi Tiết T.Toán</th>
                <th className="px-4 py-3 font-semibold">Trạng Thái</th>
                <th className="px-4 py-3 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 text-sm">
              {rows.map(item => {
                const type = getPackageType(item.packageUsed);
                return (
                <tr key={item.id} className="transition hover:bg-ivory/60">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-ink">{initialCustomers.find(c => c.id === item.customerId)?.name || "Unknown"}</p>
                    <p className="text-[11px] text-ink/50">{item.time} - {item.date}</p>
                  </td>
                  <td className="px-4 py-3.5 text-ink/75">
                    <div className="flex flex-wrap gap-1">
                      {(item.serviceIds || (item as any).services || []).map((sid, idx) => { const s = serviceOptions.find(opt => opt.id === sid)?.name || sid; return (
                        <span key={idx} className="inline-block px-1.5 py-0.5 rounded-[2px] bg-ink/5 text-[11px] text-ink/80">{s}</span> ); })}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-ink/75">{masterTherapists.find(t => t.id === item.therapistId)?.name || "Unknown"}</td>
                  <td className="px-4 py-3.5 text-xs font-medium text-emerald">{getPackageName(item.packageUsed)}</td>
                  <td className="px-4 py-3.5 text-right font-semibold">
                    {type === "none" && <span className="text-ink">{formatVnd(item.price || 0)}</span>}
                    {type === "sessions" && (
                      <div className="flex flex-col items-end">
                         <span className="text-emerald text-xs">Thẻ: -{item.sessionsDeducted} buổi</span>
                         {(item.price || 0) > 0 && <span className="text-ink text-xs">Mặt: +{formatVnd(item.price || 0)}</span>}
                      </div>
                    )}
                    {type === "balance" && (
                      <div className="flex flex-col items-end">
                         <span className="text-emerald text-xs">Thẻ: -{formatVnd(item.balanceDeducted || 0)}</span>
                         {(item.price || 0) > 0 && <span className="text-ink text-xs">Mặt: +{formatVnd(item.price || 0)}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={item.status}
                      onChange={(e) => changeStatus(item.id, item.status, e.target.value as AppointmentStatus)}
                      className={`inline-block rounded-[3px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] outline-none cursor-pointer appearance-none ${statusClass[item.status]}`}
                    >
                      {filters.filter(f => f.key !== "all").map(f => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-emerald/40 hover:text-emerald">
                      <Pencil className="size-3" /> Sửa
                    </button>
                    
                  </td>
                </tr>
              )})}
            </tbody>
          </table>

          {rows.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-ink/50">Chưa có lịch hẹn nào ở trạng thái này.</p>
          )}
        </div>
      ) : (
        <div id="grid-scroll-container" className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-180px)] rounded-[3px] border border-ink/10 bg-ivory-deep/30 relative">
          <div id="grid-container" className="min-w-[900px]">
            <div
              className="sticky top-0 z-30 grid border-b border-ink/10 bg-ivory-deep/95 backdrop-blur shadow-sm"
              style={{ gridTemplateColumns: `60px repeat(${therapists.length}, minmax(200px, 1fr))` }}
            >
              <div className="border-r border-ink/10 px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45 text-center">
                Giờ
              </div>
              {therapists.map((therapist) => (
                <div key={therapist.name} className="border-r border-ink/10 px-4 py-3 last:border-r-0 text-center">
                  <p className="text-sm font-semibold text-ink">{therapist.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink/50">{therapist.sessions} lịch trong ngày</p>
                </div>
              ))}
            </div>
            
            
            {(() => {
              // Compute dynamic row heights
              const hasEvent = Array(64).fill(false);
              rows.forEach(appointment => {
                const startMins = appointment.time.split(':').reduce((h, m) => h * 60 + Number(m), 0) - 8 * 60;
                const endMins = appointment.endTime ? appointment.endTime.split(':').reduce((h, m) => h * 60 + Number(m), 0) - 8 * 60 : startMins + 60;
                const startRow = Math.max(0, Math.floor(startMins / 15));
                const endRow = Math.min(64, Math.floor(endMins / 15));
                for (let i = startRow; i < endRow; i++) {
                  hasEvent[i] = true;
                }
              });
              
              const gridTemplateRows = hasEvent.map(has => has ? (isCapturing ? 'minmax(60px, auto)' : '60px') : '20px').join(' ');
              
              return (
                <div className="grid bg-ivory/45" style={{ gridTemplateColumns: `60px repeat(${therapists.length}, minmax(200px, 1fr))`, gridTemplateRows }}>
                  {/* Background Rows */}
                  {Array.from({ length: 64 }).map((_, i) => {
                    const hour = Math.floor(i / 4) + 8;
                    const min = (i % 4) * 15;
                    const timeStr = hour + ':' + (min === 0 ? '00' : min);
                    const isHour = min === 0;
                    return (
                      <div id={'time-row-'+i} key={'bg-row-'+i} className={`border-b pointer-events-none ${isHour ? 'border-ink/15' : 'border-ink/5 border-dashed'}`} style={{ gridColumn: '1 / -1', gridRow: i + 1 }} />
                    );
                  })}
                  
                  {/* Column Borders */}
                  {therapists.map((_, i) => (
                    <div key={'bg-col-'+i} className="border-r border-ink/10 pointer-events-none" style={{ gridColumn: i + 2, gridRow: '1 / span 64' }} />
                  ))}
                  
                  {/* Time Axis */}
                  {Array.from({ length: 64 }).map((_, i) => {
                    const hour = Math.floor(i / 4) + 8;
                    const min = (i % 4) * 15;
                    const timeStr = hour + ':' + (min === 0 ? '00' : min);
                    const isHour = min === 0;
                    if (!isHour && !hasEvent[i]) return null;
                    return (
                      <div key={'time-'+i} className="border-r border-ink/10 flex items-start justify-center pt-0.5 pointer-events-none bg-ivory-deep/30" style={{ gridColumn: 1, gridRow: i + 1 }}>
                        <span className="text-[10px] font-semibold text-ink/40">{timeStr}</span>
                      </div>
                    );
                  })}
                  
                  {/* Cards */}
                  {therapists.map((therapist, colIdx) => (
                    rows.filter(r => r.therapistId === therapist.id || r.therapist === therapist.name).map(appointment => {
                      const startMins = appointment.time.split(':').reduce((h, m) => h * 60 + Number(m), 0) - 8 * 60;
                      const endMins = appointment.endTime ? appointment.endTime.split(':').reduce((h, m) => h * 60 + Number(m), 0) - 8 * 60 : startMins + 60;
                      const startRow = Math.max(0, Math.floor(startMins / 15)) + 1;
                      const endRow = Math.min(64, Math.floor(endMins / 15)) + 1;
                      
                      return (
                        <article key={appointment.id} className={`rounded-[3px] border p-2.5 flex flex-col justify-between ${isCapturing ? '!min-h-max overflow-visible z-50' : 'overflow-hidden hover:!min-h-max hover:z-[60] hover:shadow-xl'} transition-all cursor-default ${statusClass[appointment.status]}`} style={{ gridColumn: colIdx + 2, gridRowStart: startRow, gridRowEnd: endRow, margin: '4px', zIndex: 20, ...getGridCardStyle(appointment) }}>
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-sm font-semibold" style={{ color: getGridCardStyle(appointment).color || undefined }}>{initialCustomers.find(c => c.id === appointment.customerId)?.name || "Unknown"}</p>
                              <div className="flex items-center gap-1 shrink-0">
                                <select
                                  value={appointment.status}
                                  onChange={(e) => changeStatus(appointment.id, appointment.status, e.target.value as any)}
                                  className={`shrink-0 rounded-[3px] border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] outline-none cursor-pointer appearance-none ${statusClass[appointment.status]}`} style={getGridCardStyle(appointment)}
                                >
                                  {[{key:'cho', label: 'Chờ tiếp đón'}, {key:'dang', label: 'Đang chăm sóc'}, {key:'xong', label: 'Hoàn thành'}, {key:'huy', label: 'Hủy'}].map(f => (
                                    <option key={f.key} value={f.key}>{f.label}</option>
                                  ))}
                                </select>
                                <button type="button" onClick={() => startEdit(appointment)} className="inline-flex items-center gap-1 text-[10px] font-semibold hover:text-champagne" style={{ color: getGridCardStyle(appointment).color || undefined }}>
                                  ✎
                                </button>
                              </div>
                            </div>
                            <p className="mt-0.5 text-[10px] font-bold" style={{ color: getGridCardStyle(appointment).color || undefined }}>{appointment.time} - {appointment.endTime || appointment.time}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(appointment.serviceIds || (appointment as any).services || []).map((sid: string, idx: number) => { const s = serviceOptions.find(opt => opt.id === sid)?.name || sid; return (
                                <span key={idx} className="inline-block px-1.5 py-0.5 rounded-[2px] bg-ink/5 text-[9px] text-ink/80" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>{s}</span> ); })}
                            </div>
                            <div className="mt-1.5 flex flex-col gap-1 items-start">
                              {appointment.packageUsed && (
                                <p className="inline-block rounded-[3px] bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>
                                  Dùng thẻ: {getPackageName(appointment.packageUsed)} 
                                  <span className="font-bold"> (-{getPackageType(appointment.packageUsed) === 'balance' ? formatVnd(appointment.balanceDeducted || 0) : `${appointment.sessionsDeducted || 0} buổi`})</span>
                                </p>
                              )}
                              {(appointment.price || 0) > 0 && (
                                <p className="inline-block rounded-[3px] bg-ink/10 px-1.5 py-0.5 text-[9px] font-semibold text-ink" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>
                                  Thu tiền: <span className="font-bold">{formatVnd(appointment.price || 0)}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}








