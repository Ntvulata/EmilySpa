const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

const regex = /const name = parts\[0\]\.trim\(\);\s*const duration = Number\(parts\[1\]\.trim\(\)\);\s*const price = Number\(parts\[2\]\.trim\(\)\);\s*if \(name && duration && price\) \{\s*const item = \{ id: "[^"]+" \+ Date\.now\(\) \+ Math\.random\(\)\.toString\(36\)\.substr\(2, 5\), name, duration: \`\$\{duration\} ph.*?t\`, price, commission: 0 \};/g;

code = code.replace(regex, `const name = parts[0].trim();
                          const duration = Number(parts[1].trim());
                          const price = Number(parts[2].trim());
                          const commission = parts.length >= 4 ? Number(parts[3].trim()) : 0;
                          if (name && duration && price) {
                            const item = { id: "SRV_" + Date.now() + Math.random().toString(36).substr(2, 5), name, duration: \`\${duration} phút\`, price, commission: isNaN(commission) ? 0 : commission };`);

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Regex replacement done.");
