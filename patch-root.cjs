const fs = require('fs');
let code = fs.readFileSync('src/routes/__root.tsx', 'utf8');

code = code.replace(/<html(.*?)>/, '<html$1 suppressHydrationWarning>');
code = code.replace(/<body(.*?)>/, '<body$1 suppressHydrationWarning>');

fs.writeFileSync('src/routes/__root.tsx', code, 'utf8');
console.log("Patched root for hydration warnings");
