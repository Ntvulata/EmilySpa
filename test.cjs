const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Patch 1: Make top-left Giờ header sticky left
const oldHeader = `<div className="border-r border-ink/10 px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45 text-center">
                  Gi?
                </div>`;
const oldHeaderRegex = /<div className="border-r border-ink\/10 px-2 py-4 text-\[10px\] font-semibold uppercase tracking-\[0\.16em\] text-ink\/45 text-center">\s*Gi\?\s*<\/div>/g;

const newHeader = `<div className="sticky left-0 z-40 border-r border-ink/10 px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45 text-center bg-ivory-deep/95 backdrop-blur shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Giờ
                </div>`;

// Actually the file has Gi? instead of Giờ due to encoding issues in the terminal output, let's just use string replace on a smaller snippet.
