const fs = require('fs');
let code = fs.readFileSync('src/routes/index.tsx', 'utf8');

code = code.replace(
  /setMessage\(`[^`]+\$\{userMatch\.username\}[^`]+`\);\n\s*navigate\(\{ to: "\/dashboard" \}\);/,
  'setMessage(`Đăng nhập thành công. Chào mừng ${userMatch.username} trở lại.`);\n      localStorage.setItem("spa_user", JSON.stringify({ username: userMatch.username, role: userMatch.username === "admin" ? "admin" : "user" }));\n      navigate({ to: "/dashboard" });'
);

fs.writeFileSync('src/routes/index.tsx', code, 'utf8');
console.log("Fixed login localStorage");
