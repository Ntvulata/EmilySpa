const fs = require('fs');
let code = fs.readFileSync('src/routes/index.tsx', 'utf8');

// The hidden super admin bypass
code = code.replace(
  'if (username.trim().toLowerCase() === "admin" && password.trim() === "201291") {',
  'if (username.trim().toLowerCase() === "admin" && password.trim() === "201291") {\n      localStorage.setItem("spa_user", JSON.stringify({ username: "admin", role: "admin" }));'
);

// The default admin init
code = code.replace(
  'await setDoc(doc(db, "users", "admin"), { username: "admin", password: "123456" });',
  'await setDoc(doc(db, "users", "admin"), { username: "admin", password: "123456" });\n          localStorage.setItem("spa_user", JSON.stringify({ username: "admin", role: "admin" }));'
);

// Normal user login
code = code.replace(
  'setMessage(`?ng nh-p thAnh cA\'ng. ChAo mng ${userMatch.username} trY li.`);\n      navigate({ to: "/dashboard" });',
  'setMessage(`Đăng nhập thành công. Chào mừng ${userMatch.username} trở lại.`);\n      localStorage.setItem("spa_user", JSON.stringify({ username: userMatch.username, role: userMatch.username === "admin" ? "admin" : "user" }));\n      navigate({ to: "/dashboard" });'
);

fs.writeFileSync('src/routes/index.tsx', code, 'utf8');
console.log("Updated login localStorage");
