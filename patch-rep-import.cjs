const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

// Remove fbGetTherapists from spa-data import
code = code.replace(/, fbGetTherapists } from "@\/lib\/spa-data";/, " } from \"@/lib/spa-data\";");

// Add it to firebase import
if (!code.includes("from \"@/lib/firebase\"")) {
    code = `import { fbGetTherapists } from "@/lib/firebase";\n` + code;
} else {
    code = code.replace(/import \{([^}]*)\} from "@\/lib\/firebase";/, "import { $1, fbGetTherapists } from \"@/lib/firebase\";");
}

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Patched imports.");
