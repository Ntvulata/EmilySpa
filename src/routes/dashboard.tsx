import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Sparkles,
  Users,
  Phone,
  CreditCard,
  Loader2
} from "lucide-react";
import { fetchInitialData } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const navItems = [
  { to: "/dashboard", label: "Tổng Quan", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/appointments", label: "Lịch Hẹn Spa", icon: CalendarDays, exact: false },
  { to: "/dashboard/customers", label: "Khách Hàng", icon: Users,
  Phone, exact: false },
  { to: "/dashboard/services", label: "Dịch Vụ & Nhân Viên", icon: Sparkles, exact: false },
  { to: "/dashboard/packages-history", label: "Lịch Sử Gói/Thẻ", icon: CreditCard, exact: false },
  { to: "/dashboard/reports", label: "Báo Cáo Doanh Thu", icon: LineChart, exact: false },
  { to: "/dashboard/settings", label: "Cài Đặt", icon: Settings, exact: false },
] as const;

function DashboardLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await fetchInitialData();
      if (mounted) {
        setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-emerald" />
          <p className="text-sm font-semibold text-ink/70">Đang đồng bộ dữ liệu từ Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory font-body text-ink antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-ink/10 bg-emerald text-ivory lg:min-h-screen lg:w-[264px] lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-6 py-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-champagne/60 bg-ivory/10 font-display text-xl italic text-champagne-soft">
              E
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg text-ivory">Emily Spa</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-champagne-soft/80">
                Luxury Management
              </p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible lg:px-3">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                className="group flex shrink-0 items-center gap-3 rounded-[3px] px-3 py-2.5 text-[13px] font-medium whitespace-nowrap text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory data-[status=active]:bg-ivory/15 data-[status=active]:text-ivory"
              >
                <Icon className="size-4 shrink-0 opacity-80" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto hidden px-6 pb-6 lg:block">
            <div className="rounded-[3px] border border-ivory/15 bg-ivory/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-champagne-soft/80">
                Đang đăng nhập
              </p>
              <p className="mt-1.5 text-sm text-ivory">Quản trị viên</p>
              <Link
                to="/"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-champagne transition hover:text-ivory"
              >
                <LogOut className="size-3.5" /> Đăng xuất
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-ivory/70 px-5 py-4 backdrop-blur-sm sm:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-soft">
                Hệ thống quản lý
              </p>
              <p className="mt-0.5 text-sm capitalize text-ink/65">{today}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                to="/dashboard/packages-history"
                search={{ action: "new" }}
                className="rounded-[3px] border border-emerald px-4 py-2.5 text-xs font-semibold text-emerald transition hover:bg-emerald/10 hidden sm:block"
              >
                Mua gói/thẻ
              </Link>
              <Link
                to="/dashboard/appointments"
                className="rounded-[3px] bg-emerald px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
              >
                Đặt lịch ngay
              </Link>
              <Link
                to="/"
                className="rounded-[3px] border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink/70 transition hover:border-emerald/40 hover:text-emerald lg:hidden"
              >
                Đăng xuất
              </Link>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="mt-auto border-t border-ink/5 bg-ivory/50 px-5 py-4 text-center sm:px-8">
            <p className="text-[11px] font-medium text-ink/40 uppercase tracking-[0.05em]">
              &copy; 2026 Emily Spa &bull; Luxury Management &bull; Phát triển bởi <span className="font-bold text-ink/60">Nguyễn Tuấn Vũ</span> &bull; <Phone className="inline-block size-3.5 -mt-0.5 mr-0.5" /> 0943.867.865
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

