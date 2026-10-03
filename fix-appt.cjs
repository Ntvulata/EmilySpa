const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const target = `const master = masterPackages.find(m => m.id === id);
        if (master) {
          active.push({ id, name: master.name, type: master.type, remaining: rem });
        }`;

const replacement = `const master = masterPackages.find(m => m.id === id);
        if (master) {
          active.push({ id, name: master.name, type: master.type, remaining: rem });
        } else if (id.startsWith("CUSTOM_")) {
          const h = packageHistory.find(x => x.packageId === id && x.customName);
          active.push({ id, name: h ? (h.customName || id) : id, type: "sessions", remaining: rem });
        }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Updated customerPackages in appointments");
