const fs = require('fs');
let code = fs.readFileSync('src/routes/__root.tsx', 'utf8');

const oldMeta = `{ name: "viewport", content: "width=device-width, initial-scale=1" },`;
const newMeta = `{ name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },`;

if(code.includes(oldMeta)) {
    code = code.replace(oldMeta, newMeta);
    fs.writeFileSync('src/routes/__root.tsx', code, 'utf8');
    console.log("Patched meta tags in __root.tsx");
} else {
    console.log("Meta tag not found!");
}
