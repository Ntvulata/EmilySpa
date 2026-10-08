const fs = require('fs');
let code = fs.readFileSync('src/styles.css', 'utf8');

const utilities = `
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }
  .mb-safe {
    margin-bottom: env(safe-area-inset-bottom, 20px);
  }
}
`;

if (!code.includes('.scrollbar-hide')) {
    code += utilities;
    fs.writeFileSync('src/styles.css', code, 'utf8');
    console.log("Added utilities to styles.css");
}
