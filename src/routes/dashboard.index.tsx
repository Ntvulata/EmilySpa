import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Coins, UserPlus, Users, Scissors } from "lucide-react";

import { appointments, formatVnd, serviceMix, statusClass, statusLabel, therapists, initialCustomers } from "@/lib/spa-data";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Tổng quan | Emily Spa" },
      { name: "description", content: "Bảng tổng quan lịch hẹn, khách hàng và doanh thu trong ngày của Emily Spa." },
      { property: "og:title", content: "Tổng quan | Emily Spa" },
      { property: "og:description", content: "Theo dõi lịch hẹn, khách hàng và doanh thu Emily Spa theo thời gian thực." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardOverview,
});

function DashboardOverview() {
  const activeAppts = appointments.filter(a => a.status !== 'huy');
  const revenue = activeAppts.reduce((sum, item) => sum + item.price, 0);
  const done = activeAppts.filter((item) => item.status === 'xong').length;
  const servicesToday = activeAppts.reduce((sum, item) => sum + item.services.length, 0);
  const busyKtv = new Set(activeAppts.filter(a => a.status === 'dang' && a.therapist).map(a => a.therapist)).size;
  const totalKtv = therapists.filter((t: any) => !t.role || t.role === "Kỹ thuật viên").length;
  const freeKtv = Math.max(0, totalKtv - busyKtv);
  
  const stats = [
    { label: 'Lịch hẹn hôm nay', value: String(activeAppts.length), hint: `${done} lượt đã hoàn thành`, icon: CalendarCheck },
    { label: 'Dịch vụ hôm nay', value: String(servicesToday), hint: 'Tổng số dịch vụ được đặt', icon: Scissors },
    { label: 'Doanh thu dự kiến', value: formatVnd(revenue), hint: 'Chưa gồm bán gói liệu trình', icon: Coins },
    { label: 'KTV đang phục vụ', value: `${busyKtv}/${totalKtv}`, hint: `${freeKtv} kỹ thuật viên đang trống`, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Tổng quan hôm nay</h1>
        <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink/65">
          Theo dõi nhanh tình hình đặt lịch, khách hàng và doanh thu của Emily Spa.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className="rounded-[3px] border border-ink/10 bg-ivory-deep/45 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">{label}</p>
              <Icon className="size-4 shrink-0 text-champagne" />
            </div>
            <p className="mt-3 font-display text-3xl text-emerald">{value}</p>
            <p className="mt-1.5 text-xs text-ink/50">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Lịch hẹn sắp tới</h2>
            <Link
              to="/dashboard/appointments"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald transition hover:text-champagne"
            >
              Xem tất cả <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <ul className="divide-y divide-ink/10">
            {appointments.slice(0, 5).map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 py-3.5">
                <span className="w-14 shrink-0 font-display text-xl text-emerald">{item.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.customer}</p>
                  <p className="truncate text-xs text-ink/55">
                    {item.service} · {item.therapist}
                  </p>
                </div>
                <span className={`shrink-0 rounded-[3px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusClass[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/dashboard/appointments"
              className="rounded-[3px] bg-emerald px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
            >
              Tạo lịch hẹn mới
            </Link>
            <Link
              to="/dashboard/customers"
              className="rounded-[3px] border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink/70 transition hover:border-emerald/40 hover:text-emerald"
            >
              Thêm hồ sơ khách
            </Link>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
            <h2 className="font-display text-2xl text-ink">Cơ cấu dịch vụ</h2>
            <ul className="mt-4 space-y-3.5">
              {serviceMix.map((item) => (
                <li key={item.name}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-ink/70">{item.name}</span>
                    <span className="font-semibold text-emerald">{item.share}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                    <div className="h-full rounded-full bg-emerald" style={{ width: `${item.share}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
            <h2 className="font-display text-2xl text-ink">Năng suất kỹ thuật viên</h2>
            <ul className="mt-4 space-y-3">
              {therapists.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{item.name}</p>
                    <p className="text-xs text-ink/50">{item.sessions} lượt phục vụ</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-emerald">{formatVnd(item.revenue)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
