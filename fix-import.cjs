const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// Move import React to the top if it's inside the function
code = code.replace(/import React from "react";/g, '');
code = 'import React from "react";\n' + code;

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
