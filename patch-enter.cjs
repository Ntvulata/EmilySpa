const fs = require('fs');
const files = ['src/routes/dashboard.appointments.tsx', 'src/routes/dashboard.packages-history.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // We are replacing inside SearchableSelect input.
  const searchPattern = `onChange={(e) => setSearch(e.target.value)}`;
  const replacement = `onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filtered.length > 0) {
                    e.preventDefault();
                    onChange(filtered[0].value);
                    setOpen(false);
                  }
                }}`;

  if (code.includes(searchPattern) && !code.includes('filtered.length > 0')) {
    code = code.replace(searchPattern, replacement);
    fs.writeFileSync(file, code, 'utf8');
    console.log(`Patched ${file}`);
  }
}
