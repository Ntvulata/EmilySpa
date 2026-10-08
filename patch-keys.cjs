const fs = require('fs');
const files = ['src/routes/dashboard.appointments.tsx', 'src/routes/dashboard.packages-history.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // We are replacing inside SearchableSelect only.
  const searchPattern = `onClick={() => { setOpen(!open); setSearch(""); }}`;
  const replacement = `onClick={() => { setOpen(!open); setSearch(""); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || (e.altKey && e.key === "ArrowDown")) {
              e.preventDefault();
              setOpen(!open);
              setSearch("");
            }
          }}`;

  if (code.includes(searchPattern) && !code.includes('onKeyDown={(e) =>')) {
    code = code.replace(searchPattern, replacement);
    fs.writeFileSync(file, code, 'utf8');
    console.log(`Patched ${file}`);
  }
}
