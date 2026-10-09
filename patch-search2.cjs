const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const regex = /return h\.id\.toLowerCase\(\)\.includes\(q\) \|\|[\s\S]*?\(h\.note && h\.note\.toLowerCase\(\)\.includes\(q\)\);/m;
const newPH = `const qClean = removeVietnameseTones(q);
      return removeVietnameseTones(h.id.toLowerCase()).includes(qClean) || 
             removeVietnameseTones(cName).includes(qClean) || 
             cPhone.includes(qClean) || 
             removeVietnameseTones(pName).includes(qClean) || 
             (h.note && removeVietnameseTones(h.note.toLowerCase()).includes(qClean));`;

if (regex.test(code)) {
    code = code.replace(regex, newPH);
    fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
    console.log("Patched packages-history with regex");
} else {
    console.log("Regex missed!");
}
