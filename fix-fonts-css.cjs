const fs = require('fs');
let code = fs.readFileSync('src/styles.css', 'utf8');

code = code.replace(/--font-display:\s*"Instrument Serif"[^;]+;/g, '--font-display: "Playfair Display", Georgia, serif;');
code = code.replace(/--font-body:\s*"Work Sans"[^;]+;/g, '--font-body: "Be Vietnam Pro", system-ui, sans-serif;');

fs.writeFileSync('src/styles.css', code, 'utf8');
