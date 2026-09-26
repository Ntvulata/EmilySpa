const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

code = code.replace(/fbDeleteService\(s\.name\)/g, 'fbDeleteService(s.id)');
code = code.replace(/if \(oldName !== name\) \{[\s\S]*?fbDeleteService\(oldName\)\.catch\(console\.error\);[\s\S]*?\}/g, '');
code = code.replace(/fbDeleteTherapist\(t\.name\)/g, 'fbDeleteTherapist(t.id)');
code = code.replace(/if \(oldName !== name\) \{[\s\S]*?fbDeleteTherapist\(oldName\)\.catch\(console\.error\);[\s\S]*?\}/g, '');

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
