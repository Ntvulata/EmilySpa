const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.settings.tsx', 'utf8');

if (!code.includes('const isAdmin =')) {
  code = code.replace(
    '  const [notice, setNotice] = useState("");',
    '  const [notice, setNotice] = useState("");\n  const userStr = typeof window !== "undefined" ? localStorage.getItem("spa_user") : "{}";\n  const currentUser = JSON.parse(userStr || "{}");\n  const isAdmin = currentUser.role === "admin";'
  );
}

// Find the <section> that contains User Management and wrap it with {isAdmin && (...)}
const sectionRegex = /(<section className="rounded-\[3px\] border border-ink\/10 bg-ivory-deep\/30 p-5 sm:p-6 max-w-4xl">[\s\S]*?<h2 className="font-display text-2xl text-ink">Danh sAch tAi khon[\s\S]*?<\/section>)/;
const match = code.match(sectionRegex);
if (match) {
  code = code.replace(sectionRegex, '{isAdmin && (\n$1\n)}');
} else {
  // Wait, maybe the regex didn't match due to encoding. Let's find it more generically:
  const sectionStart = code.indexOf('<section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6 max-w-4xl">');
  // There are two such sections. First one is settings. Second is users.
  // Actually, I can just find "Danh" or "users.map".
  const h2Idx = code.indexOf('<h2 className="font-display text-2xl text-ink">Danh');
  if (h2Idx > -1) {
    const startIdx = code.lastIndexOf('<section', h2Idx);
    const endIdx = code.indexOf('</section>', startIdx) + 10;
    const sectionText = code.slice(startIdx, endIdx);
    code = code.slice(0, startIdx) + '{isAdmin && (' + sectionText + ')}' + code.slice(endIdx);
  }
}

fs.writeFileSync('src/routes/dashboard.settings.tsx', code, 'utf8');
console.log("Applied RBAC to dashboard.settings.tsx");
