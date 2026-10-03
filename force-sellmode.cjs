const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

if (!code.includes('const [sellMode, setSellMode] = useState<"master" | "custom">("master");')) {
  code = code.replace(
    'function PackagesHistoryPage() {\n  const { action } = Route.useSearch();',
    'function PackagesHistoryPage() {\n  const [sellMode, setSellMode] = useState<"master" | "custom">("master");\n  const { action } = Route.useSearch();'
  );
  
  // Also try with \r\n just in case
  code = code.replace(
    'function PackagesHistoryPage() {\r\n  const { action } = Route.useSearch();',
    'function PackagesHistoryPage() {\r\n  const [sellMode, setSellMode] = useState<"master" | "custom">("master");\r\n  const { action } = Route.useSearch();'
  );

  fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
  console.log("SUCCESSFULLY ADDED sellMode!");
} else {
  console.log("sellMode ALREADY EXISTS in the file! (Wait, where?)");
}
