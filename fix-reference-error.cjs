const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// Remove sellMode from SearchableSelect
code = code.replace(
  /const \[sellMode, setSellMode\] = useState<"master" \| "custom">\("master"\);\s*/,
  ''
);

// Add sellMode to PackagesHistoryPage
code = code.replace(
  /function PackagesHistoryPage\(\) \{\n\s*const \{ action \} = Route\.useSearch\(\);/,
  `function PackagesHistoryPage() {
  const [sellMode, setSellMode] = useState<"master" | "custom">("master");
  const { action } = Route.useSearch();`
);

// We must also ensure form.serviceId is initialized in the state!
code = code.replace(
  /const \[form, setForm\] = useState\(\{[\s\S]*?date: new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\],[\s\S]*?customerId: "",[\s\S]*?packageId: "",[\s\S]*?valueChange: "",[\s\S]*?pricePaid: "",[\s\S]*?note: ""\s*\}\);/,
  `const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    customerId: "",
    packageId: "",
    serviceId: "",
    valueChange: "",
    pricePaid: "",
    note: ""
  });`
);

// And we must also update startNew to include serviceId
code = code.replace(
  /setForm\(\{ \n\s*date: new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\], \n\s*customerId: "", \n\s*packageId: "", \n\s*valueChange: "", \n\s*pricePaid: "",\n\s*note: "" \n\s*\}\);/,
  `setSellMode("master");
      setForm({ 
        date: new Date().toISOString().split("T")[0], 
        customerId: "", 
        packageId: "", 
        serviceId: "",
        valueChange: "", 
        pricePaid: "",
        note: "" 
      });`
);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Fixed sellMode ReferenceError!");
