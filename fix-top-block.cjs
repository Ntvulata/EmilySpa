const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Find and remove the top package dropdown block
const topStartStr = '{customerPackages.length > 0 && (';
const topStartIdx = code.indexOf(topStartStr);
if (topStartIdx === -1) { console.log("WARN: top block not found"); process.exit(0); }

// Search for end: </select> then </div> then )}
let searchIdx = topStartIdx;
const selectEndStr = '</select>';
const selectEndIdx = code.indexOf(selectEndStr, searchIdx);
// After </select> find the next </div>\n                )} 
const divCloseStr = '</div>';
let divCloseIdx = code.indexOf(divCloseStr, selectEndIdx + selectEndStr.length);
// Then find the )}
const closeBraceStr = ')}';
let closeBraceIdx = code.indexOf(closeBraceStr, divCloseIdx + divCloseStr.length);

if (closeBraceIdx !== -1) {
  code = code.substring(0, topStartIdx) + code.substring(closeBraceIdx + closeBraceStr.length);
  console.log("Removed top package dropdown block");
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
