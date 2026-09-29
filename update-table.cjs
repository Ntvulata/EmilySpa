const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Replace headers
const oldHeaders = `<th className="px-4 py-3 font-semibold">Khách Hàng</th>
                  <th className="px-4 py-3 font-semibold">Dịch Vụ</th>
                  <th className="px-4 py-3 font-semibold">Kỹ Thuật Viên</th>
                  <th className="px-4 py-3 font-semibold">Thẻ Áp Dụng</th>
                  <th className="px-4 py-3 font-semibold text-right">Chi Tiết T.Toán</th>
                  <th className="px-4 py-3 font-semibold">Trạng Thái</th>
                  <th className="px-4 py-3 font-semibold text-right">Thao Tác</th>`;

const newHeaders = `<th className="px-4 py-3 font-semibold w-[15%]">Khách Hàng</th>
                  <th className="px-4 py-3 font-semibold w-[22%]">Dịch Vụ</th>
                  <th className="px-4 py-3 font-semibold w-[15%]">Ghi Chú</th>
                  <th className="px-4 py-3 font-semibold w-[11%]">KTV</th>
                  <th className="px-4 py-3 font-semibold w-[11%]">Thẻ</th>
                  <th className="px-4 py-3 font-semibold text-right w-[10%]">T.Toán</th>
                  <th className="px-4 py-3 font-semibold w-[10%]">Trạng Thái</th>
                  <th className="px-4 py-3 font-semibold text-right w-20">Thao Tác</th>`;

// Note: Because of powershell encoding issues, I'll use regex to match the table headers safely
code = code.replace(
  /<th className="px-4 py-3 font-semibold">Kh[^<]+<\/th>\s*<th className="px-4 py-3 font-semibold">D[^<]+<\/th>\s*<th className="px-4 py-3 font-semibold">K[^<]+<\/th>\s*<th className="px-4 py-3 font-semibold">Th[^<]+<\/th>\s*<th className="px-4 py-3 font-semibold text-right">Chi[^<]+<\/th>\s*<th className="px-4 py-3 font-semibold">Tr[^<]+<\/th>\s*<th className="px-4 py-3 font-semibold text-right">Thao[^<]+<\/th>/,
  newHeaders
);

// Add Ghi chú column in tbody
// We'll find:
// <td className="px-4 py-3.5 text-ink/75">{dbTherapists.find(t => t.id === item.therapistId)?.name || "Unknown"}</td>
const newTd = `<td className="px-4 py-3.5 text-ink/75 text-xs italic break-words">{item.note || <span className="text-ink/30 opacity-50">-</span>}</td>
                    <td className="px-4 py-3.5 text-ink/75">{dbTherapists.find(t => t.id === item.therapistId)?.name || "Unknown"}</td>`;

code = code.replace(
  /<td className="px-4 py-3\.5 text-ink\/75">\{dbTherapists\.find\(t => t\.id === item\.therapistId\)\?\.name \|\| "Unknown"\}<\/td>/g,
  newTd
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Updated list view table columns");
