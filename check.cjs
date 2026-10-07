const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');
const match = code.match(/<section[^>]*>\s*<div[^>]*>\s*<div>\s*<h2[^>]*>Báo Cáo Thẻ Khách Hàng<\/h2>[\s\S]*?<\/section>/);
if (match) {
    console.log("Found it!");
} else {
    const match2 = code.match(/<section[\s\S]*?Báo Cáo Thẻ Khách Hàng[\s\S]*?<\/section>/);
    if (match2) {
        console.log("Found it with loose match!");
        console.log(match2[0].substring(0, 100));
    } else {
        console.log("Not found at all.");
    }
}
