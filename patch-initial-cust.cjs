const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

const replacement = `      if (editIdx !== null) {
        const updated = [...customers];
        oldPhone = updated[editIdx].phone;
        newCustomer = { ...updated[editIdx], ...form, activePackages };
        updated[editIdx] = newCustomer;
        setCustomers(updated);
        const masterIdx = initialCustomers.findIndex(c => c.id === newCustomer.id);
        if (masterIdx !== -1) initialCustomers[masterIdx] = newCustomer;
        setNotice(\`Đã cập nhật thông tin cho \${form.name.trim()}.\`);
      } else {
        newCustomer = { ...form, visits: 0, activePackages };
        setCustomers([...customers, newCustomer]);
        initialCustomers.push(newCustomer as any);
        setNotice(\`Đã thêm khách hàng mới: \${form.name.trim()}.\`);
      }`;

const target = `      if (editIdx !== null) {
        const updated = [...customers];
        oldPhone = updated[editIdx].phone;
        newCustomer = { ...updated[editIdx], ...form, activePackages };
        updated[editIdx] = newCustomer;
        setCustomers(updated);
        setNotice(\`Da c?p nh?t thng tin cho \${form.name.trim()}.\`);
      } else {
        newCustomer = { ...form, visits: 0, activePackages };
        setCustomers([...customers, newCustomer]);
        setNotice(\`Da thm khch hng m?i: \${form.name.trim()}.\`);
      }`;

// since encoding might mess up regex, let's use a simpler index approach
const idxStart = code.indexOf('if (editIdx !== null) {');
const idxEnd = code.indexOf('// Save to Firebase');

if (idxStart !== -1 && idxEnd !== -1) {
    const chunk = code.substring(idxStart, idxEnd);
    code = code.replace(chunk, replacement + "\n\n      ");
    fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
    console.log("Patched initialCustomers update.");
} else {
    console.log("Could not find chunk.");
}
