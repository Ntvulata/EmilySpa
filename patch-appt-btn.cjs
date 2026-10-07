const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const targetStr = `onChange={e => setToDate(e.target.value)} />
              </label>
            </>`;
            
const repStr = `onChange={e => setToDate(e.target.value)} />
              </label>
              <button type="button" onClick={exportList} className="ml-2 inline-flex items-center gap-1.5 rounded-[3px] bg-emerald px-3 py-1.5 text-[11px] font-semibold text-ivory hover:bg-emerald/80 transition">
                <Download className="size-3.5" /> Tải Danh Sách
              </button>
            </>`;
            
let codeIdx = code.indexOf(targetStr);
if (codeIdx !== -1) {
    code = code.replace(targetStr, repStr);
    fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
    console.log("Button injected!");
} else {
    // try fallback
    const targetStr2 = `onChange={e => setToDate(e.target.value)} />\r\n                </label>\r\n              </>`;
    const repStr2 = `onChange={e => setToDate(e.target.value)} />\r\n                </label>\r\n                <button type="button" onClick={exportList} className="ml-2 inline-flex items-center gap-1.5 rounded-[3px] bg-emerald px-3 py-1.5 text-[11px] font-semibold text-ivory hover:bg-emerald/80 transition">\r\n                  <Download className="size-3.5" /> Tải Danh Sách\r\n                </button>\r\n              </>`;
    if (code.indexOf(targetStr2) !== -1) {
        code = code.replace(targetStr2, repStr2);
        fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
        console.log("Button injected via fallback!");
    } else {
        // loose match
        const regex = /(onChange=\{e => setToDate\(e\.target\.value\)\} \/>\s*<\/label>\s*)<\/>/;
        if (code.match(regex)) {
             code = code.replace(regex, `$1<button type="button" onClick={exportList} className="ml-2 inline-flex items-center gap-1.5 rounded-[3px] bg-emerald px-3 py-1.5 text-[11px] font-semibold text-ivory hover:bg-emerald/80 transition"><Download className="size-3.5" /> Tải Danh Sách</button></>`);
             fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
             console.log("Button injected via regex!");
        } else {
             console.log("Could not find button insertion point.");
        }
    }
}
