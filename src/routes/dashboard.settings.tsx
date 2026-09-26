import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fbSaveSettings, fbGetSettings, fbGetUsers, fbSaveUser, fbDeleteUser } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Cài đặt | Emily Spa" },
      { name: "description", content: "Cài đặt thông tin cơ sở, tài khoản và sao lưu dữ liệu của Emily Spa." },
    ],
  }),
  component: SettingsPage,
});

const fieldClass =
  "w-full rounded-[3px] border border-ink/15 bg-ivory/75 px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-emerald focus:bg-ivory focus:ring-2 focus:ring-emerald/15";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65";

function SettingsPage() {
  const [spaName, setSpaName] = useState("Emily Spa");
  const [spaPhone, setSpaPhone] = useState("");
  const [spaAddress, setSpaAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fbGetSettings()
      .then((data) => {
        if (data) {
          setSpaName(data.spaName || "Emily Spa");
          setSpaPhone(data.spaPhone || "");
          setSpaAddress(data.spaAddress || "");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
      
    fbGetUsers().then(u => setUsers(u)).catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    try {
      await fbSaveSettings({ spaName, spaPhone, spaAddress });
      setNotice("Đã lưu thông tin cài đặt!");
      setTimeout(() => setNotice(""), 3000);
    } catch (error) {
      console.error(error);
      setNotice("Có lỗi xảy ra khi lưu thông tin.");
    }
  };

  const handleAddUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      setNotice("Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }
    try {
      const user = { username: newUsername.trim(), password: newPassword.trim() };
      await fbSaveUser(user);
      setUsers(prev => {
        const idx = prev.findIndex(u => u.username === user.username);
        if (idx !== -1) {
          const arr = [...prev];
          arr[idx] = user;
          return arr;
        }
        return [...prev, user];
      });
      setNewUsername("");
      setNewPassword("");
      setNotice("Đã lưu tài khoản thành công!");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error(err);
      setNotice("Lỗi khi thêm tài khoản.");
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username === "admin") {
      setNotice("Không thể xóa tài khoản admin gốc.");
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa tài khoản ${username}?`)) return;
    try {
      await fbDeleteUser(username);
      setUsers(users.filter(u => u.username !== username));
    } catch (err) {
      console.error(err);
      setNotice("Lỗi khi xóa tài khoản.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Cài đặt</h1>
        <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink/65">
          Thông tin cơ sở và tài khoản đăng nhập của phần mềm.
        </p>
      </div>

      {notice && (
        <p role="status" className="rounded-[3px] border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">
          {notice}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
          <h2 className="font-display text-2xl text-ink">Thông tin spa</h2>
          {loading ? (
            <p className="mt-4 text-sm text-ink/60">Đang tải...</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="spa-name" className={labelClass}>Tên spa</label>
                <input 
                  id="spa-name" 
                  value={spaName} 
                  onChange={(e) => setSpaName(e.target.value)} 
                  className={fieldClass} 
                />
              </div>
              <div>
                <label htmlFor="spa-phone" className={labelClass}>Số điện thoại</label>
                <input 
                  id="spa-phone" 
                  placeholder="Nhập số điện thoại spa" 
                  value={spaPhone} 
                  onChange={(e) => setSpaPhone(e.target.value)} 
                  className={fieldClass} 
                />
              </div>
              <div>
                <label htmlFor="spa-address" className={labelClass}>Địa chỉ cơ sở</label>
                <input 
                  id="spa-address" 
                  placeholder="Nhập địa chỉ spa" 
                  value={spaAddress} 
                  onChange={(e) => setSpaAddress(e.target.value)} 
                  className={fieldClass} 
                />
              </div>
              <button 
                type="button" 
                onClick={handleSave} 
                className="rounded-[3px] bg-emerald px-5 py-3 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </section>

        <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
          <h2 className="font-display text-2xl text-ink mb-4">Tài khoản hệ thống</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Tên đăng nhập" className={fieldClass} />
              <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mật khẩu" type="password" className={fieldClass} />
              <button type="button" onClick={handleAddUser} className="rounded-[3px] shrink-0 bg-emerald px-4 py-3 text-xs font-semibold text-ivory transition hover:bg-emerald-soft">Thêm / Lưu</button>
            </div>
            
            <div className="mt-4 overflow-hidden rounded-[3px] border border-ink/10 bg-ivory">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink/10 bg-ivory-deep/30">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-ink">Tài khoản</th>
                    <th className="px-4 py-3 font-semibold text-ink">Mật khẩu</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {users.map(u => (
                    <tr key={u.username}>
                      <td className="px-4 py-3">{u.username}</td>
                      <td className="px-4 py-3 text-ink/50">••••••</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => handleDeleteUser(u.username)} className="text-[11px] font-semibold text-champagne hover:opacity-70 uppercase">Xóa</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-ink/50">Chưa có tài khoản nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
        <h2 className="font-display text-2xl text-ink mb-4">📥 File mẫu nhập liệu (CSV)</h2>
        <div className="flex flex-wrap gap-4">
          <a href="/templates/khach-hang-mau.csv" download className="inline-flex items-center gap-2 rounded-[3px] border border-ink/15 bg-ivory px-4 py-2.5 text-sm font-semibold text-ink hover:border-emerald hover:text-emerald transition">
            Tải mẫu Khách Hàng
          </a>
          <a href="/templates/dich-vu-mau.csv" download className="inline-flex items-center gap-2 rounded-[3px] border border-ink/15 bg-ivory px-4 py-2.5 text-sm font-semibold text-ink hover:border-emerald hover:text-emerald transition">
            Tải mẫu Dịch Vụ
          </a>
          <a href="/templates/goi-the-mau.csv" download className="inline-flex items-center gap-2 rounded-[3px] border border-ink/15 bg-ivory px-4 py-2.5 text-sm font-semibold text-ink hover:border-emerald hover:text-emerald transition">
            Tải mẫu Gói/Thẻ
          </a>
        </div>
      </section>
    </div>
  );
}
