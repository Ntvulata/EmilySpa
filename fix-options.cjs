const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /{dbTherapists\.map\(t => <option key={t\.id} value={t\.id}>{t\.name}<\/option>\)}/g,
  '{dbTherapists.map(t => <option key={t.id || t.name} value={t.id || t.name}>{t.name}</option>)}'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed options key in appointments");
