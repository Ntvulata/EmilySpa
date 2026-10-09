const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const regex = /<Link to="\/dashboard\/appointments" search=\{\{ hl: item\.appointmentId \} as any\} className="([^"]+)">([\s\S]*?)<\/Link>/g;
code = code.replace(regex, `<a href={\`/dashboard/appointments?hl=\${item.appointmentId}\`} className="$1">$2</a>`);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Patched link to href");
