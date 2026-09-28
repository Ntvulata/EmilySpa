const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// Use customerId in form initialization
code = code.replace(/customer: "",/g, 'customerId: "",');
code = code.replace(/customer: item\.customer,/g, 'customerId: item.customerId,');
code = code.replace(/customer: form\.customerId,/g, 'customerId: form.customerId,');
code = code.replace(/setForm\(\{ \.\.\.form, customer: v \}\)/g, 'setForm({ ...form, customerId: v })');

// Fix customerOptions
code = code.replace(/c => \(\{ value: c\.name, label: \`\$\{c\.name\} - \$\{c\.phone\}\` \}\)/g, 'c => ({ value: c.id, label: `${c.name} - ${c.phone}` })');

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
