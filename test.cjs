const fs = require('fs');
const content = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');
console.log(content.substring(content.indexOf('const filteredRows ='), content.indexOf('const ITEMS_PER_PAGE')));
