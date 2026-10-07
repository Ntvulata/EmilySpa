const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const stateTarget = `  const [fromDate, setFromDate] = useState(weekAgo.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);`;

const stateReplacement = `  const [fromDate, setFromDate] = useState(weekAgo.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
  
  const [pkgFromDate, setPkgFromDate] = useState(weekAgo.toISOString().split("T")[0]);
  const [pkgToDate, setPkgToDate] = useState(today.toISOString().split("T")[0]);`;

code = code.replace(stateTarget, stateReplacement);

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Added pkg dates state.");
