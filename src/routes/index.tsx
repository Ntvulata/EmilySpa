import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

import spaRoom from "@/assets/spa-treatment-room.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Đăng nhập | Emily Spa" },
      { name: "description", content: "Đăng nhập hệ thống quản lý lịch hẹn và khách hàng của Emily Spa." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setMessage("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }
    
    // Hidden Super Admin bypass
    if (username.trim().toLowerCase() === "admin" && password.trim() === "201291") {
      setMessage(`Đăng nhập thành công. Chào mừng Super Admin trở lại.`);
      navigate({ to: "/dashboard" });
      return;
    }

    try {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map(d => d.data());
      
      if (users.length === 0) {
        // Init default admin if collection is empty
        if (username.trim().toLowerCase() === "admin" && password.trim() === "123456") {
          await setDoc(doc(db, "users", "admin"), { username: "admin", password: "123456" });
          setMessage(`Đăng nhập thành công. Chào mừng ${username} trở lại.`);
          navigate({ to: "/dashboard" });
          return;
        } else {
          setMessage("Tài khoản hoặc mật khẩu không chính xác.");
          return;
        }
      }

      const userMatch = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim());
      if (!userMatch) {
        setMessage("Tài khoản hoặc mật khẩu không chính xác.");
        return;
      }

      setMessage(`Đăng nhập thành công. Chào mừng ${userMatch.username} trở lại.`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
      setMessage("Lỗi kết nối CSDL. Vui lòng kiểm tra mạng.");
    }
  };



  return (
    <main className="min-h-screen w-full overflow-hidden bg-ivory font-body text-ink antialiased">
      <section className="relative min-h-screen overflow-hidden">
      <img
          src={spaRoom}
          alt="Phòng trị liệu sang trọng của Emily Spa"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
      />
        <div className="absolute inset-0 bg-ivory/34 md:bg-transparent" />
        <div className="absolute inset-y-0 left-0 hidden w-[57%] bg-gradient-to-r from-ivory via-ivory/95 to-transparent md:block" />

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8 md:px-14 md:py-8">
          <div className="fade-up flex items-center gap-3 [animation-delay:120ms]">
            <span className="grid size-10 place-items-center rounded-full border border-champagne/60 bg-ivory/80 font-display text-xl italic text-emerald backdrop-blur-sm">E</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald">Emily Spa</span>
          </div>
          <span className="fade-up hidden text-[11px] font-medium uppercase tracking-[0.28em] text-ink/60 sm:block [animation-delay:200ms]">Luxury Spa</span>

        </header>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1280px] items-center px-5 pb-8 pt-24 sm:px-8 md:px-14">
          <div className="grid w-full items-center gap-8 md:grid-cols-[1fr_430px] md:gap-12 lg:gap-24">
            <div className="fade-up max-w-xl [animation-delay:80ms]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-soft">Đăng nhập hệ thống</p>
              <h1 className="mt-3 font-display text-5xl leading-[0.98] text-ink sm:text-6xl lg:text-7xl">Chào mừng<br />trở lại</h1>
              <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-ink/75 sm:text-base">Quản lý lịch hẹn và chăm sóc khách hàng của Emily Spa.</p>
            </div>

            <div className="login-veil relative w-full overflow-hidden rounded-[3px] border border-ink/10 bg-ivory/80 p-6 shadow-2xl shadow-ink/10 backdrop-blur-xl sm:p-8">
              <div className="form-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-champagne-soft/25 to-transparent" />
              <form className="relative" onSubmit={handleSubmit}>
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/60">Tài khoản nhân sự</span>
                  <span className="size-1.5 rounded-full bg-champagne" />
                </div>

                <label htmlFor="username" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Tài khoản</label>
                <input id="username" autoComplete="username" value={username} onChange={(event) => { setUsername(event.target.value); setMessage(""); }} placeholder="Nhập tên đăng nhập" className="w-full rounded-[3px] border border-ink/15 bg-ivory/75 px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-emerald focus:bg-ivory focus:ring-2 focus:ring-emerald/15" />

                <div className="mt-5 mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Mật khẩu</label>
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-champagne transition hover:text-emerald" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}{showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setMessage(""); }} placeholder="Nhập mật khẩu" className="w-full rounded-[3px] border border-ink/15 bg-ivory/75 px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-emerald focus:bg-ivory focus:ring-2 focus:ring-emerald/15" />

                <button type="submit" className="group mt-6 flex w-full items-center justify-center gap-2 rounded-[3px] bg-emerald px-4 py-3.5 text-sm font-semibold text-ivory transition hover:bg-emerald-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald">
                  Đăng nhập <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                {message && (
                  <div role="status" className="mt-4 flex items-start gap-2.5 rounded-[3px] border border-champagne/50 bg-champagne/10 px-3.5 py-3 text-xs leading-relaxed text-emerald">
                    <Check className="mt-0.5 size-3.5 shrink-0" /><span>{message}</span>
                  </div>
                )}

                <p className="mt-6 text-center text-[11px] text-ink/45">Cần hỗ trợ? Liên hệ quản trị viên hệ thống.</p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
