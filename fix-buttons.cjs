const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// 1. Group the buttons
const buttonRegex = /(<button\s*type="button"\s*onClick=\{\(\) => open \? setOpen\(false\) : startNew\(\)\}[^>]*>[\s\S]*?<\/button>)\s*<button type="button" onClick=\{\(\) => convertOpen \? setConvertOpen\(false\) : startConvert\(\)\}[^>]*>[\s\S]*?<\/button>/;

code = code.replace(buttonRegex, (match) => {
  return '<div className="flex gap-2 items-center">' + match + '</div>';
});

// 2. Make them mutually exclusive
code = code.replace(
  /const startNew = \(\) => \{/g,
  'const startNew = () => {\n    setConvertOpen(false);'
);
code = code.replace(
  /const startEdit = \(id: string\) => \{/g,
  'const startEdit = (id: string) => {\n    setConvertOpen(false);'
);
// Also modify the onClick inline functions if they exist without startNew, but they do use startNew.

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
