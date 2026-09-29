const fs = require('fs');
let code = fs.readFileSync('src/routes/__root.tsx', 'utf8');

const linksInjection = `links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],`;

code = code.replace(/links:\s*\[[\s\S]*?\]\,/, linksInjection);
fs.writeFileSync('src/routes/__root.tsx', code, 'utf8');
