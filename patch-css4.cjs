const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf8');

const tapHighlight = `
  * {
    -webkit-tap-highlight-color: transparent;
  }
`;

css = css.replace('@layer base {', '@layer base {\n' + tapHighlight);
fs.writeFileSync('src/styles.css', css, 'utf8');
console.log("Patched tap highlight");
