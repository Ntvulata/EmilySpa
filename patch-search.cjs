const fs = require('fs');
const files = [
    'src/routes/dashboard.appointments.tsx', 
    'src/routes/dashboard.packages-history.tsx',
    'src/routes/dashboard.customers.tsx',
    'src/routes/dashboard.services.tsx'
];

for (const file of files) {
    let code = fs.readFileSync(file, 'utf8');

    if (!code.includes('removeVietnameseTones')) {
        // Add import
        code = code.replace('import {', 'import { removeVietnameseTones } from "@/lib/utils";\nimport {');
    }

    // Replace SearchableSelect filter
    const oldSS = `const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase()));`;
    const newSS = `const filtered = options.filter(o => removeVietnameseTones(o.label.toLowerCase()).includes(removeVietnameseTones(search.toLowerCase())) || removeVietnameseTones(o.value.toLowerCase()).includes(removeVietnameseTones(search.toLowerCase())));`;
    code = code.replace(oldSS, newSS);

    // Replace customers filter
    const oldC = `const filteredCustomers = customers.map((item, i) => ({item, i})).filter(({item}) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.phone.includes(search));`;
    const newC = `const filteredCustomers = customers.map((item, i) => ({item, i})).filter(({item}) => !search || removeVietnameseTones(item.name.toLowerCase()).includes(removeVietnameseTones(search.toLowerCase())) || item.phone.includes(search));`;
    // It occurs multiple times in customers.tsx, so replace globally
    code = code.split(oldC).join(newC);
    
    // Replace packages-history filter
    const oldPH = `return h.id.toLowerCase().includes(q) || \n             cName.includes(q) || \n             cPhone.includes(q) || \n             pName.includes(q) || \n             (h.note && h.note.toLowerCase().includes(q));`;
    const newPH = `const qClean = removeVietnameseTones(q);\n      return removeVietnameseTones(h.id.toLowerCase()).includes(qClean) || \n             removeVietnameseTones(cName).includes(qClean) || \n             cPhone.includes(qClean) || \n             removeVietnameseTones(pName).includes(qClean) || \n             (h.note && removeVietnameseTones(h.note.toLowerCase()).includes(qClean));`;
    code = code.replace(oldPH, newPH);
    
    // Replace services searchService
    const oldSvc = `item.name.toLowerCase().includes(searchService.toLowerCase())`;
    const newSvc = `removeVietnameseTones(item.name.toLowerCase()).includes(removeVietnameseTones(searchService.toLowerCase()))`;
    code = code.split(oldSvc).join(newSvc);

    // Replace services searchPackage
    const oldPkg = `item.name.toLowerCase().includes(searchPackage.toLowerCase())`;
    const newPkg = `removeVietnameseTones(item.name.toLowerCase()).includes(removeVietnameseTones(searchPackage.toLowerCase()))`;
    code = code.split(oldPkg).join(newPkg);

    fs.writeFileSync(file, code, 'utf8');
    console.log(`Patched searches in ${file}`);
}
