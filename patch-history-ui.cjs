const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const anchor = `<div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
        <button onClick={() => { setFilter("all"); setPage(1); }}`;

const replacement = `<div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink/50">Từ</span>
            <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} className="rounded-[3px] border border-ink/15 bg-ivory px-2 py-1 text-xs outline-none focus:border-emerald" />
            <span className="text-xs font-semibold uppercase tracking-widest text-ink/50">Đến</span>
            <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} className="rounded-[3px] border border-ink/15 bg-ivory px-2 py-1 text-xs outline-none focus:border-emerald" />
          </div>
          <div className="flex gap-2">
          <button onClick={() => { setFilter("all"); setPage(1); }}`;

let idx = code.indexOf('<div className="flex flex-wrap items-center justify-between gap-4">');
if (idx !== -1) {
    let nextIdx = code.indexOf('<button onClick={() => { setFilter("all");', idx);
    if (nextIdx !== -1) {
        code = code.substring(0, idx) + replacement + code.substring(nextIdx + '<button onClick={() => { setFilter("all"); setPage(1); }}'.length);
        fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
        console.log("Patched package history UI successfully.");
    } else {
        console.log("Could not find button");
    }
} else {
    console.log("Could not find wrapper");
}
