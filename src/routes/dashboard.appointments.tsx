import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, type FormEvent, useEffect, useRef } from "react";
import { List, TableProperties, Pencil, Trash2, Check, ChevronDown, ChevronLeft, ChevronRight, Plus, Camera, Printer, Download } from "lucide-react";
import { printReceipt } from "@/lib/print";
import { formatVnd, appointments as initialAppointments, initialCustomers, serviceOptions, masterPackages, type Appointment, type AppointmentStatus, getRemainingPackageValue, packageHistory, therapists as masterTherapists } from "@/lib/spa-data";
import { fbSaveAppointment, fbSaveAppointmentAndHistory, fbDeleteAppointment, fbGetTherapists, fbGetServices } from "@/lib/firebase";

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
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || (e.altKey && e.key === "ArrowDown")) {
              e.preventDefault();
              setOpen(!open);
              setSearch("");
            }
          }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filtered.length > 0) {
                    e.preventDefault();
                    onChange(filtered[0].value);
                    setOpen(false);
                  }
                }}
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
  d.setHours(d.getHours(), mins + addMins + addOffset, 0, 0);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function calculateTotalPrice(services: string[], serviceOptions: any[]) {
  let total = 0;
  services.forEach(id => {
    const s = serviceOptions.find(opt => opt.id === id);
    if (s && s.price) total += Number(s.price);
  });
  return total;
}

function calculateEndTime(startTime: string, services: string[], serviceOptions: any[]) {
  if (!startTime) return "";
  let totalMinutes = 0;
  services.forEach(id => {
    const s = serviceOptions.find(opt => opt.id === id);
    if (s && s.duration) {
      const parsed = typeof s.duration === 'string' ? parseInt(s.duration.replace(/\D/g, "")) : parseInt(String(s.duration || 0).replace(/\D/g, ""));
      if (!isNaN(parsed)) totalMinutes += parsed;
    }
  });
  if (totalMinutes === 0) return startTime;
  
  const [h, m] = startTime.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m + totalMinutes, 0, 0);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function AppointmentsPage() {
  const handlePrint = (item: Appointment) => {
    try {
      const customer = initialCustomers.find(c => c.id === item.customerId);
      const svcs = item.serviceIds.map(id => {
        const s = serviceOptions.find(x => x.id === id);
        return s ? s.name : id;
      });
      
      const deductions = (item.packagesDeducted || []).map(p => {
        const pDef = masterPackages.find(x => x.id === p.packageId);
        let name = pDef ? pDef.name : p.packageId;
        if (!pDef && p.packageId.startsWith("CUSTOM_")) {
           const h = packageHistory.find(x => x.packageId === p.packageId && x.customName);
           if (h) name = h.customName;
        }
        return `-${p.deducted} ${p.type === 'sessions' ? 'buổi' : 'VNĐ'} (${name})`;
      }).join(", ");
      
      printReceipt({
        id: item.id,
        date: item.date + " " + (item.time || ""),
        customerName: customer?.name || "Khách lẻ",
        customerPhone: customer?.phone || "",
        items: [
          {
            name: "Dịch vụ: " + svcs.join(", "),
            price: formatVnd(item.price || 0),
            note: deductions ? "Trừ thẻ: " + deductions : ""
          }
        ],
        total: formatVnd(item.price || 0)
      });
    } catch (e) {
      alert("Lỗi in: " + e);
    }
  };

  const userStr = typeof window !== "undefined" ? localStorage.getItem("spa_user") : "{}";
  let isAdmin = false;
  try { isAdmin = JSON.parse(userStr || "{}")?.role === "admin"; } catch(e) {}


    const exportList = () => {
    let csv = "\uFEFF\"Ngày\",\"Giờ\",\"Khách hàng\",\"SĐT\",\"Dịch vụ\",\"Ghi chú\",\"KTV\",\"Sử dụng thẻ\",\"Thanh toán\",\"Trạng thái\"\n";
    rows.forEach(item => {
      const cust = initialCustomers.find(c => c.id === item.customerId);
      const cName = cust ? cust.name : item.customerId;
      const cPhone = cust ? cust.phone : "";
      const svcs = (item.serviceIds || item.services || []).map(sid => serviceOptions.find(opt => opt.id === sid)?.name || sid).join(", ");
      
      let pkgText = "";
      if (item.packagesDeducted && item.packagesDeducted.length > 0) {
        pkgText = item.packagesDeducted.map(p => {
          const pDef = masterPackages.find(x => x.id === p.packageId);
          let name = pDef ? pDef.name : p.packageId;
          if (!pDef && p.packageId.startsWith("CUSTOM_")) {
            const h = packageHistory.find(x => x.packageId === p.packageId && x.customName);
            if (h) name = h.customName;
          }
          return `${name} (-${p.type === 'balance' ? formatVnd(p.deducted || 0) : (p.deducted || 0) + ' buổi'})`;
        }).join(" | ");
      }
      
      let st = item.status === "xong" ? "Hoàn thành" : (item.status === "huy" ? "Khách hủy" : "Chờ phục vụ");
      csv += `"${item.date}","${item.time}","${cName.replace(/"/g, '""')}","${cPhone}","${svcs.replace(/"/g, '""')}","${(item.note || "").replace(/"/g, '""')}","${(dbTherapists.find(t => t.id === item.therapistId || t.name === item.therapistId)?.name || item.therapistId || "").replace(/"/g, '""')}","${pkgText.replace(/"/g, '""')}","${formatVnd(item.price || 0).replace(/"/g, '""')}","${st}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_Sach_Lich_Hen_${fromDate}_${toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  const [dbTherapists, setDbTherapists] = useState<any[]>([]);
  useEffect(() => {
    fbGetTherapists().then(data => {
      if (data && data.length > 0) {
        setDbTherapists(data);
      } else {
        setDbTherapists(masterTherapists);
      }
    }).catch(console.error);
    fbGetServices().then(data => {
      if (data && data.length > 0) {
        serviceOptions.length = 0; // Clear the hardcoded options
        data.forEach(d => serviceOptions.push(d));
        setTick(t => t + 1); // Trigger re-render
      }
    }).catch(console.error);

  }, []);

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
    note: string;
}>({
    date: new Date().toISOString().split("T")[0],
    time: getNext15MinTime(),
      endTime: getNext15MinTime(60),
    customerId: "",
    serviceIds: serviceOptions.length > 0 ? [serviceOptions[0].id] : [""],
    therapistId: dbTherapists[0]?.id || dbTherapists[0]?.name || "",
    status: "cho",
    packageUsed: "",
      packagesDeducted: [],
      price: serviceOptions.length > 0 && serviceOptions[0].price ? Number(serviceOptions[0].price).toLocaleString("en-US") : "",
        sessionsDeducted: "1",
    balanceDeducted: "",
        note: ""
      });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const timeSlots = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30", "19:00"];
  const therapistNames = dbTherapists
      .filter((t: any) => !t.role || t.role.includes("thu") || t.role.includes("K1") || t.role === "Kỹ thuật viên")
    .map(t => t.name);

    const getPackageName = (id?: string) => {
    if (!id) return "Không dùng thẻ";
    const p = masterPackages.find(x => x.id === id);
    if (p) return p.name;
    const h = packageHistory.find(x => x.packageId === id && x.customName);
    return h ? h.customName : id;
  };

    const getPackageType = (id?: string) => {
    if (!id) return "none";
    const p = masterPackages.find(x => x.id === id);
    if (p) return p.type;
    if (id.startsWith("CUSTOM_")) return "sessions";
    return "none";
  };

  const rows = useMemo(() => {
    return appts.filter((item) => {
      const matchDate = viewMode === "grid" 
        ? item.date === toDate 
        : item.date >= fromDate && item.date <= toDate;
      let matchStatus = statusFilter === "all" || item.status === statusFilter;
        if (viewMode === "grid" && item.status === "huy") matchStatus = false;
        return matchDate && matchStatus;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }, [appts, fromDate, toDate, statusFilter, viewMode]);

    const therapists = useMemo(() => {
    return therapistNames.map(name => {
      const tObj = dbTherapists.find((d: any) => d.name === name);
      const tId = tObj?.id || name;
      return {
        id: tId,
        name,
        sessions: rows.filter(r => r.therapistId === tId || r.therapistId === name || r.therapist === name).length
      };
    });
  }, [rows, therapistNames, dbTherapists]);

  const customerOptions = initialCustomers.map(c => ({ value: c.id, label: `${c.name} - ${c.phone}` }));

  // Khách hàng hiện tại đang chọn để xem họ có thẻ gì
  const customerPackages = useMemo(() => {
    if (!form.customerId) return [];
    
    // Thu thập tất cả các gói từ history
    const pkgIds = new Set<string>();
    packageHistory
      .filter(h => h.customerId === form.customerId)
      .forEach(h => pkgIds.add(h.packageId));
    
    // Fallback lấy từ initialCustomers nếu cần (nếu chưa có trong history)
    const c = initialCustomers.find(x => x.id === form.customerId);
    if (c && c.activePackages) c.activePackages.forEach(p => pkgIds.add(p.packageId));

        const active: { id: string, name: string, type: 'sessions' | 'balance', remaining: number }[] = [];
    pkgIds.forEach(id => {
      const hasSell = packageHistory.some(h => h.customerId === form.customerId && h.packageId === id && h.type === "sell");
      const validSells = packageHistory.filter(h => h.customerId === form.customerId && h.packageId === id && h.type === "sell" && h.date <= form.date);
      
      // Khách mua gói thẻ SAU ngày lịch hẹn này, nên không thể dùng để trừ cho lịch này
      if (hasSell && validSells.length === 0) return;

      const rem = getRemainingPackageValue(form.customerId, id);
      
      if (rem > 0 || form.packagesDeducted.some(pd => pd.packageId === id) || form.packageUsed === id) {
        const master = masterPackages.find(m => m.id === id);
        if (master) {
          active.push({ id, name: master.name, type: master.type, remaining: rem });
        } else if (id.startsWith("CUSTOM_")) {
          const h = packageHistory.find(x => x.packageId === id && x.customName);
          active.push({ id, name: h ? (h.customName || id) : id, type: "sessions", remaining: rem });
        }
      }
    });
    return active;
  }, [form.customerId, form.date, form.packagesDeducted, form.packageUsed, appts]);

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
      therapistId: dbTherapists[0]?.id || dbTherapists[0]?.name || "",
      status: "cho",
      packageUsed: "",
      packagesDeducted: [],
      price: serviceOptions.length > 0 && serviceOptions[0].price ? Number(serviceOptions[0].price).toLocaleString("en-US") : "",
        sessionsDeducted: "1",
      balanceDeducted: ""
    });
    setEditId(null);
    setOpen(true);
    setError("");
    setNotice("");
  };

  
  const startEdit = (item: Appointment) => {
    if (!isAdmin && item.status === "xong") {
      const itemDate = new Date(item.date);
      const today = new Date(new Date().toISOString().split("T")[0]);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (itemDate < yesterday) {
        alert("Bạn không có quyền sửa lịch hẹn đã hoàn thành từ " + item.date + " (chỉ được sửa lịch của hôm nay và hôm qua).");
        return;
      }
    }

    setForm({
      date: item.date,
      time: item.time,
        endTime: item.endTime || calculateEndTime(item.time, item.serviceIds || (item as any).services || [], serviceOptions),
      customerId: item.customerId,
      serviceIds: [...(item.serviceIds || (item as any).services || [])],
      therapistId: item.therapistId,
      status: item.status,
      packageUsed: item.packageUsed || "",
      packagesDeducted: item.packagesDeducted ? item.packagesDeducted.map(p => ({...p, deducted: String(p.deducted)})) : (item.packageUsed ? [{ packageId: item.packageUsed, type: (item.balanceDeducted ? "balance" : "sessions") as "sessions"|"balance", deducted: item.balanceDeducted ? String(item.balanceDeducted) : String(item.sessionsDeducted || 1) }] : []),
      price: item.price ? Number(item.price).toLocaleString("en-US") : "",
      sessionsDeducted: item.sessionsDeducted ? String(item.sessionsDeducted) : "1",
      balanceDeducted: item.balanceDeducted ? Number(item.balanceDeducted).toLocaleString("en-US") : "",
        note: item.note || ""
      });
    setEditId(item.id);
    setOpen(true);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (id: string) => {
    const oldAppt = initialAppointments.find(x => x.id === id);
    if (oldAppt && oldAppt.status === "xong") {
      alert("Không thể xóa lịch hẹn đã Hoàn thành!");
      return;
    }
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

  const processPackageDeduction = (apptId: string, apptDate: string, customerId: string, packageId: string, type: 'sessions' | 'balance', dedSessions: number, dedBalance: number) => {
    const nextId = "HT-" + Date.now();
    const note = `Làm dịch vụ ${apptId}`;
    const valueChange = type === "sessions" ? -dedSessions : -dedBalance;
    
    const record: any = {
      id: nextId,
      date: apptDate,
      type: "deduct",
      customerId,
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
    let newRecords: any[] = [];

    const oldAppt = initialAppointments.find(x => x.id === id);
    if (oldAppt) {
      updatedAppt = { ...oldAppt, status: newStatus };
      
      const isNewlyCompleted = oldStatus !== "xong" && newStatus === "xong";
      if (isNewlyCompleted && updatedAppt.packageUsed) {
        const t = getPackageType(updatedAppt.packageUsed);
        if (updatedAppt.packagesDeducted && updatedAppt.packagesDeducted.length > 0) {
          newRecords = updatedAppt.packagesDeducted.map(pkg => 
            processPackageDeduction(updatedAppt.id, updatedAppt.date, updatedAppt.customerId, pkg.packageId, pkg.type,
              pkg.type === "sessions" ? pkg.deducted : 0,
              pkg.type === "balance" ? pkg.deducted : 0)
          );
        } else if (updatedAppt.packageUsed) {
          const t = getPackageType(updatedAppt.packageUsed);
          newRecords = [processPackageDeduction(
            updatedAppt.id, updatedAppt.date, updatedAppt.customerId, updatedAppt.packageUsed, t,
            updatedAppt.sessionsDeducted || 0, updatedAppt.balanceDeducted || 0)];
        }
      }
      
      const idx = initialAppointments.findIndex(x => x.id === id);
      if (idx !== -1) initialAppointments[idx] = updatedAppt;
      setAppts([...initialAppointments]);
    }

    if (updatedAppt) {
      try {
        await fbSaveAppointmentAndHistory(updatedAppt, newRecords.length > 0 ? newRecords : null, null);
      } catch (err) {
        console.error("Lỗi khi lưu đổi trạng thái", err);
      }
    }
  };

  const submit = async (e: FormEvent) => {
    try {
      e.preventDefault();
      
      let finalEndTime = form.endTime || form.time;
      if (form.status === "xong") {
        try {
          const now = new Date();
          const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          const localDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
          if (form.date === localDate) {
            if (finalEndTime > currentHHMM) finalEndTime = currentHHMM;
          }
        } catch (e) {
          console.error(e);
        }
        if (finalEndTime < form.time) finalEndTime = form.time;
      }

      if (!form.customerId) { alert("Vui lòng chọn khách hàng."); return; }
      if (finalEndTime < form.time) { alert("Giờ kết thúc không được nhỏ hơn giờ bắt đầu."); return; }

      const hasOverlap = appts.some(app => {
        if (app.id === editId || app.status === 'huy' || app.date !== form.date || app.therapistId !== form.therapistId) return false;
        const appEndTime = app.endTime || app.time;
        return form.time < appEndTime && finalEndTime > app.time;
      });

      if (hasOverlap) { alert("KTV này đã có lịch hẹn khác trong khoảng thời gian này!"); return; }
      if (form.serviceIds.length === 0) { alert("Vui lòng chọn ít nhất 1 dịch vụ."); return; }

      const p = form.price ? Number(String(form.price).replace(/\D/g, "")) : 0;
      
      // Multi-package validation
      if (form.status === "xong" && form.packagesDeducted.length > 0) {
        for (const pkg of form.packagesDeducted) {
          const dedVal = Number(String(pkg.deducted).replace(/\D/g, "")) || 0;
          if (dedVal <= 0) { alert("Vui lòng nhập số lượng trừ cho gói thẻ."); return; }
          let rem = getRemainingPackageValue(form.customerId, pkg.packageId);
          if (editId) {
            const oldAppt = initialAppointments.find(x => x.id === editId);
            if (oldAppt?.status === "xong" && oldAppt.packagesDeducted) {
              const oldPkg = oldAppt.packagesDeducted.find(op => op.packageId === pkg.packageId);
              if (oldPkg) rem += oldPkg.deducted;
            } else if (oldAppt?.status === "xong" && oldAppt.packageUsed === pkg.packageId) {
              if (pkg.type === "sessions") rem += (oldAppt.sessionsDeducted || 0);
              if (pkg.type === "balance") rem += (oldAppt.balanceDeducted || 0);
            }
          }
          if (pkg.type === "sessions" && dedVal > rem) { alert(`Gói "${customerPackages.find(c=>c.id===pkg.packageId)?.name}" chỉ còn ${rem} buổi, không đủ để trừ ${dedVal} buổi.`); return; }
          if (pkg.type === "balance" && dedVal > rem) { alert(`Gói "${customerPackages.find(c=>c.id===pkg.packageId)?.name}" chỉ còn ${formatVnd(rem)}, không đủ để trừ ${formatVnd(dedVal)}.`); return; }
        }
      }

      let savedAppt: Appointment;
      let newHistoryRecords: any[] = [];
      let deletedHistoryIds: string[] = [];

      if (editId) {
        const oldAppt = initialAppointments.find(x => x.id === editId);
        if (!oldAppt) { alert("Lỗi: Không tìm thấy lịch hẹn cũ."); return; }

        if (oldAppt.status === "xong" && form.status === "huy") {
            alert("Lịch đang hoàn thành không được chuyển qua Hủy.");
            return;
          }
          const isRevertingCompleted = oldAppt?.status === "xong" && form.status !== "xong";
        
        // Hoàn lại tất cả các gói thẻ nếu đang revert từ Hoàn thành
        if (isRevertingCompleted && (oldAppt.packagesDeducted?.length || oldAppt.packageUsed)) {
          if (!window.confirm(`Bạn có muốn HOÀN LẠI số dư/buổi cho khách không?\nTrạng thái đổi từ 'Hoàn thành' sang '${form.status}'`)) {
            return;
          }
          const toDelete = packageHistory.filter(h => h.appointmentId === editId && h.type === "deduct");
          toDelete.forEach(r => {
            deletedHistoryIds.push(r.id);
            const idx = packageHistory.findIndex(h => h.id === r.id);
            if (idx !== -1) packageHistory.splice(idx, 1);
          });
        }

        savedAppt = {
            ...oldAppt,
            ...form,
            endTime: finalEndTime,
            price: p,
            packagesDeducted: form.packagesDeducted.map(p => ({...p, deducted: Number(String(p.deducted).replace(/\D/g, "")) || 0})),
            sessionsDeducted: 0,
            balanceDeducted: 0,
            note: form.note ? String(form.note).trim() : ""
        };

        const isNewlyCompleted = oldAppt.status !== "xong" && form.status === "xong";
          const isEditingCompleted = oldAppt.status === "xong" && form.status === "xong";

          if (isEditingCompleted) {
            const toDelete = packageHistory.filter(h => h.appointmentId === editId && h.type === "deduct");
            toDelete.forEach(r => {
              deletedHistoryIds.push(r.id);
              const idx = packageHistory.findIndex(h => h.id === r.id);
              if (idx !== -1) packageHistory.splice(idx, 1);
            });
          }

          if ((isNewlyCompleted || isEditingCompleted) && form.packagesDeducted.length > 0) {
            newHistoryRecords = form.packagesDeducted.map(pkg => {
              const dedVal = Number(String(pkg.deducted).replace(/\D/g, "")) || 0;
              return processPackageDeduction(
                savedAppt.id, savedAppt.date, savedAppt.customerId, pkg.packageId, pkg.type, 
                pkg.type === "sessions" ? dedVal : 0, 
                pkg.type === "balance" ? dedVal : 0
              );
            });
          }
          
          const idx = initialAppointments.findIndex(x => x.id === editId);
        if (idx !== -1) initialAppointments[idx] = savedAppt;
        setAppts([...initialAppointments]);
        setNotice("Đã cập nhật lịch hẹn.");
      } else {
        const nextId = "LH-" + (initialAppointments.length + 2001);
        savedAppt = {
          id: nextId,
          date: form.date,
          time: form.time,
          endTime: finalEndTime,
          customerId: form.customerId,
          services: [...form.serviceIds],
          therapistId: form.therapistId,
          status: form.status,
          packageUsed: form.packageUsed,
          price: p,
          packagesDeducted: form.packagesDeducted.map(p => ({...p, deducted: Number(String(p.deducted).replace(/\D/g, "")) || 0})),
            sessionsDeducted: 0,
            balanceDeducted: 0,
            note: form.note ? String(form.note).trim() : ""
        };

        if (form.status === "xong" && form.packagesDeducted.length > 0) {
          newHistoryRecords = form.packagesDeducted.map(pkg => {
            const dedVal = Number(String(pkg.deducted).replace(/\D/g, "")) || 0;
            return processPackageDeduction(
              savedAppt.id, savedAppt.date, savedAppt.customerId, pkg.packageId, pkg.type,
              pkg.type === "sessions" ? dedVal : 0,
              pkg.type === "balance" ? dedVal : 0
            );
          });
        }

        initialAppointments.push(savedAppt);
        setAppts([...initialAppointments]);
        setNotice("Đã thêm lịch hẹn mới.");
      }

      try {
        await fbSaveAppointmentAndHistory(savedAppt, newHistoryRecords.length > 0 ? newHistoryRecords : null, deletedHistoryIds.length > 0 ? deletedHistoryIds : null);
      } catch (err: any) {
        alert("Lỗi lưu Cloud: " + err.message);
        console.error(err);
      }
      
      setOpen(false);
    } catch (criticalError: any) {
      alert("Lỗi kĩ thuật (Crash): " + criticalError.message);
    }
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
                <input type="text" placeholder="HH:mm" maxLength={5} className={inputClass} value={form.time} onChange={e => {
                    let v = e.target.value.replace(/[^0-9:]/g, "");
                    if (v.length === 2 && !v.includes(":") && form.time.length < 2) v += ":";
                    setForm({...form, time: v, endTime: v.length === 5 ? calculateEndTime(v, form.serviceIds, serviceOptions) : form.endTime});
                  }} onBlur={e => {
                    let v = e.target.value;
                    if (/^\d{1,2}:\d{2}$/.test(v)) {
                      let [h, m] = v.split(":").map(Number);
                      if (h > 23) h = 23; if (m > 59) m = 59;
                      v = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                      setForm({...form, time: v, endTime: calculateEndTime(v, form.serviceIds, serviceOptions)});
                    }
                  }} />
              </label>
              <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
                Kết thúc
                <input type="text" placeholder="HH:mm" maxLength={5} className={inputClass} value={form.endTime} onChange={e => {
                    let v = e.target.value.replace(/[^0-9:]/g, "");
                    if (v.length === 2 && !v.includes(":") && form.endTime.length < 2) v += ":";
                    setForm({...form, endTime: v});
                  }} onBlur={e => {
                    let v = e.target.value;
                    if (/^\d{1,2}:\d{2}$/.test(v)) {
                      let [h, m] = v.split(":").map(Number);
                      if (h > 23) h = 23; if (m > 59) m = 59;
                      v = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                      setForm({...form, endTime: v});
                    }
                  }} />
              </label>
            </div>
            <div className={`sm:col-span-2 grid gap-4 ${customerPackages.length > 0 ? "grid-cols-3" : "grid-cols-1"}`}>
              <div className={`space-y-1.5 ${customerPackages.length > 0 ? "col-span-2" : "col-span-1"}`}>
                <label className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Khách Hàng</label>
                <SearchableSelect
                  options={customerOptions}
                  value={form.customerId}
                  onChange={(v) => { 
                    const total = calculateTotalPrice(form.serviceIds, serviceOptions);
                    setForm({ ...form, customerId: v, packageUsed: "", packagesDeducted: [], price: total > 0 ? total.toLocaleString("en-US") : "" }); 
                    setError(""); 
                  }}
                  placeholder="-- Chọn khách hàng --"
                />
              </div>
              
              
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Dịch vụ</span>
              <div className="space-y-2">
                {(form.serviceIds || []).map((svc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                        <SearchableSelect
                          options={serviceOptions.map(s => ({ value: s.id, label: `${s.name} - ${s.price ? Number(s.price).toLocaleString("en-US") + " VNĐ" : "0 VNĐ"}` }))}
                          value={svc}
                          onChange={v => {
                              const newS = [...form.serviceIds];
                              newS[i] = v;
                              const endTime = calculateEndTime(form.time, newS, serviceOptions);
                              let newPrice = form.price;
                              if (!form.packageUsed) {
                                const total = calculateTotalPrice(newS, serviceOptions);
                                newPrice = total > 0 ? total.toLocaleString("en-US") : "";
                              }
                              setForm({...form, serviceIds: newS, endTime, price: newPrice});
                            }}
                          placeholder="-- Chọn dịch vụ --"
                        />
                      </div>
                      {form.serviceIds.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const newS = form.serviceIds.filter((_, idx) => idx !== i);
                              const endTime = calculateEndTime(form.time, newS, serviceOptions);
                              let newPrice = form.price;
                              if (!form.packageUsed) {
                                const total = calculateTotalPrice(newS, serviceOptions);
                                newPrice = total > 0 ? total.toLocaleString("en-US") : "";
                              }
                              setForm({...form, serviceIds: newS, endTime, price: newPrice});
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
                {dbTherapists.map(t => <option key={t.id || t.name} value={t.id || t.name}>{t.name}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
              Trạng thái
              <select className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value as AppointmentStatus})}>
                {filters.filter(f => f.key !== "all").map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </label>

            <div className="sm:col-span-2 rounded-[6px] border border-emerald/20 bg-emerald/[0.02] mt-2 p-4">
              <p className="text-sm font-bold mb-3 text-ink flex items-center gap-2">💳 Thanh toán & Trừ thẻ</p>
              
              {customerPackages.length > 0 && (
                <div className="mb-4 space-y-2 border-b border-emerald/10 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Trừ vào gói thẻ</span>
                    <select
                      className="rounded-[3px] border border-ink/15 bg-ivory px-2 py-1.5 text-xs outline-none focus:border-emerald"
                      value=""
                      onChange={e => {
                        const newPkg = e.target.value;
                        if (!newPkg) return;
                        if (form.packagesDeducted.some(p => p.packageId === newPkg)) return;
                        const pkgDef = customerPackages.find(p => p.id === newPkg);
                        if (!pkgDef) return;
                        setForm({...form, packagesDeducted: [...form.packagesDeducted, { packageId: newPkg, type: pkgDef.type, deducted: pkgDef.type === "sessions" ? "1" : "" }]});
                      }}
                    >
                      <option value="">+ Chọn gói thẻ để trừ...</option>
                      {customerPackages.filter(p => !form.packagesDeducted.some(pd => pd.packageId === p.id)).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - Còn {p.type === "balance" ? formatVnd(p.remaining) : `${p.remaining} buổi`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {form.packagesDeducted.map((pkg, i) => {
                    const pDef = customerPackages.find(p => p.id === pkg.packageId);
                    if (!pDef) return null;
                    return (
                      <div key={pkg.packageId} className="flex flex-wrap items-end gap-3 rounded-[3px] bg-white p-3 shadow-sm ring-1 ring-ink/5 mt-2">
                        <div className="flex-1 min-w-[120px]">
                          <p className="text-xs font-semibold text-ink">{pDef.name}</p>
                          <p className="text-[10px] text-ink/50 mt-0.5">Còn {pDef.type === "balance" ? formatVnd(pDef.remaining) : `${pDef.remaining} buổi`}</p>
                        </div>
                        <div className="w-32">
                          <label className="text-[10px] uppercase text-ink/50 font-bold mb-1 block">
                            {pDef.type === "balance" ? "Số tiền trừ" : "Số buổi trừ"}
                          </label>
                          <input 
                            className={inputClass + " !py-1.5"} 
                            value={pkg.deducted}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, "");
                              const val = pDef.type === "balance" ? (raw ? Number(raw).toLocaleString("en-US") : "") : raw;
                              const newArr = [...form.packagesDeducted];
                              newArr[i] = {...newArr[i], deducted: val};
                              setForm({...form, packagesDeducted: newArr});
                            }}
                            inputMode="numeric"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setForm({...form, packagesDeducted: form.packagesDeducted.filter((_, idx) => idx !== i)});
                          }}
                          className="text-ink/40 hover:text-red-500 p-1.5 transition"
                          title="Bỏ gói thẻ này"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
                   Số tiền thực thu (Thanh toán thêm/dịch vụ ngoài)
                   <input className={inputClass} value={form.price} onChange={e => {
                     const raw = e.target.value.replace(/\D/g, "");
                     setForm({...form, price: raw ? Number(raw).toLocaleString("en-US") : ""});
                   }} inputMode="numeric" placeholder="VND..." />
                </label>
              </div>
            </div>


          <label className="space-y-1.5 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Ghi chú</span>
                <textarea 
                  className={inputClass} 
                  rows={2}
                  value={form.note} 
                  onChange={e => setForm({...form, note: e.target.value})} 
                  placeholder="Ghi chú thêm về lịch hẹn, yêu cầu của khách..."
                />
              </label>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          <div className="mt-5 flex items-center justify-between">
              {editId && (initialAppointments.find(x => x.id === editId)?.status !== "dang" && initialAppointments.find(x => x.id === editId)?.status !== "xong") ? (
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
            <button type="button" onClick={exportList} className="ml-2 inline-flex items-center gap-1.5 rounded-[3px] bg-emerald px-3 py-1.5 text-[11px] font-semibold text-ivory hover:bg-emerald/80 transition"><Download className="size-3.5" /> Tải Danh Sách</button></>
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
                <th className="px-4 py-3 font-semibold w-[15%]">Khách Hàng</th>
                  <th className="px-4 py-3 font-semibold w-[22%]">Dịch Vụ</th>
                  <th className="px-4 py-3 font-semibold w-[15%]">Ghi Chú</th>
                  <th className="px-4 py-3 font-semibold w-[11%]">KTV</th>
                  <th className="px-4 py-3 font-semibold w-[11%]">Thẻ</th>
                  <th className="px-4 py-3 font-semibold text-right w-[10%]">T.Toán</th>
                  <th className="px-4 py-3 font-semibold w-[10%]">Trạng Thái</th>
                  <th className="px-4 py-3 font-semibold text-right w-20">Thao Tác</th>
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
                  <td className="px-4 py-3.5 text-ink/75 text-xs italic break-words">{item.note || <span className="text-ink/30 opacity-50">-</span>}</td>
                    <td className="px-4 py-3.5 text-ink/75">{dbTherapists.find(t => t.id === item.therapistId)?.name || "Unknown"}</td>
                  <td className="px-4 py-3.5 text-xs font-medium text-emerald">
    {item.packagesDeducted && item.packagesDeducted.length > 0
      ? item.packagesDeducted.map(p => getPackageName(p.packageId)).join(", ")
      : getPackageName(item.packageUsed)}
  </td>
                  <td className="px-4 py-3.5 text-right font-semibold">
                      <div className="flex flex-col items-end">
                        {item.packagesDeducted && item.packagesDeducted.length > 0 ? (
                          item.packagesDeducted.map((p, idx) => (
                            <span key={idx} className="text-emerald text-xs">Thẻ: -{p.type === 'balance' ? formatVnd(p.deducted || 0) : `${p.deducted || 0} buổi`}</span>
                          ))
                        ) : (
                          <>
                            {type === "sessions" && <span className="text-emerald text-xs">Thẻ: -{item.sessionsDeducted} buổi</span>}
                            {type === "balance" && <span className="text-emerald text-xs">Thẻ: -{formatVnd(item.balanceDeducted || 0)}</span>}
                          </>
                        )}
                        {((item.price || 0) > 0 || (type === "none" && !(item.packagesDeducted && item.packagesDeducted.length > 0))) && (
                          <span className="text-ink text-xs">{type === "none" && !(item.packagesDeducted && item.packagesDeducted.length > 0) ? "" : "Mặt: +"}{formatVnd(item.price || 0)}</span>
                        )}
                      </div>
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
                    {item.status === "xong" && (
                      <button type="button" onClick={() => handlePrint(item)} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-champagne/40 hover:text-champagne ml-2">
                        <Printer className="size-3" /> In phiếu
                      </button>
                    )}
                    
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
                    rows.filter(r => { const tId = r.therapistId || r.therapist || dbTherapists[0]?.name || ""; return tId === therapist.id || tId === therapist.name; }).map(appointment => {
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
                              {appointment.packagesDeducted && appointment.packagesDeducted.length > 0 ? (
                                appointment.packagesDeducted.map((p, idx) => (
                                  <p key={idx} className="inline-block rounded-[3px] bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>
                                    Dùng thẻ: {getPackageName(p.packageId)} 
                                    <span className="font-bold"> (-{p.type === 'balance' ? formatVnd(p.deducted || 0) : `${p.deducted || 0} buổi`})</span>
                                  </p>
                                ))
                                                            ) : appointment.packageUsed && (
                                <p className="inline-block rounded-[3px] bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>
                                  Dùng thẻ: {getPackageName(appointment.packageUsed)} 
                                  <span className="font-bold"> (-{getPackageType(appointment.packageUsed) === 'balance' ? formatVnd(appointment.balanceDeducted || 0) : `${appointment.sessionsDeducted || 0} buổi`})</span>
                                </p>
                              )}
                                {appointment.note && (
                                  <p className="mt-1 text-[10px] italic opacity-80 border-l-2 pl-1.5 border-current">
                                    {appointment.note}
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








