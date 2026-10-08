const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf8');

const iosInputs = `
  input[type="text"],
  input[type="number"],
  input[type="date"],
  input[type="time"],
  textarea {
    -webkit-appearance: none;
    appearance: none;
    border-radius: 3px;
  }
`;

css = css.replace('@layer base {', '@layer base {\n' + iosInputs);
fs.writeFileSync('src/styles.css', css, 'utf8');
console.log("Patched iOS inputs styling");
