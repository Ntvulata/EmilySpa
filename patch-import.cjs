const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(/import \{([^}]*)\} from "lucide-react";/, (match, p1) => {
    if (!p1.includes("Download")) {
        return `import { ${p1.trim()}, Download } from "lucide-react";`;
    }
    return match;
});

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Imported Download.");
