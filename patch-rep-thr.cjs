const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

if (!code.includes("fbGetTherapists")) {
    // Import fbGetTherapists
    code = code.replace(/import \{([^}]*)\} from "@\/lib\/spa-data";/, "import { $1, fbGetTherapists } from \"@/lib/spa-data\";");
    
    // Add state & useEffect
    const hookStart = `  const [fromDate, setFromDate] = useState(weekAgo.toISOString().split("T")[0]);`;
    const newHooks = `  const [dbTherapists, setDbTherapists] = useState<any[]>(masterTherapists);
  React.useEffect(() => {
    fbGetTherapists().then(data => {
      if (data && data.length > 0) setDbTherapists(data);
    }).catch(console.error);
  }, []);
  
  const [fromDate, setFromDate] = useState(weekAgo.toISOString().split("T")[0]);`;
    code = code.replace(hookStart, newHooks);
    
    // Need to import React for useEffect if not there
    if (!code.includes("import React")) {
        code = `import React from 'react';\n` + code;
    }
}

// Replace masterTherapists with dbTherapists
code = code.replace(/masterTherapists\.map/g, "dbTherapists.map");
code = code.replace(/masterTherapists\.find/g, "dbTherapists.find");

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Patched dbTherapists in reports CSV");
