const fs = require('fs');
let code = fs.readFileSync('src/lib/spa-data.ts', 'utf8');

// Update ServiceDef
code = code.replace(
  /export type ServiceDef = \{ id: string; name: string; price: number; duration: string; \};/,
  'export type ServiceDef = { id: string; name: string; price: number; duration: string; commission: number; };'
);

// Update serviceOptions default data
code = code.replace(
  /export const serviceOptions: ServiceDef\[\] = \[\n  \{ id: "SRV1", name: "Chăm sóc da chuyên sâu", price: 800000, duration: "90 phút" \},\n  \{ id: "SRV2", name: "Massage Body Tinh dầu", price: 650000, duration: "60 phút" \},\n  \{ id: "SRV3", name: "Gội đầu dưỡng sinh", price: 250000, duration: "45 phút" \},\n  \{ id: "SRV4", name: "Triệt lông vĩnh viễn \(Nách\)", price: 350000, duration: "30 phút" \},\n\];/,
  `export const serviceOptions: ServiceDef[] = [
  { id: "SRV1", name: "Chăm sóc da chuyên sâu", price: 800000, duration: "90 phút", commission: 50000 },
  { id: "SRV2", name: "Massage Body Tinh dầu", price: 650000, duration: "60 phút", commission: 100000 },
  { id: "SRV3", name: "Gội đầu dưỡng sinh", price: 250000, duration: "45 phút", commission: 30000 },
  { id: "SRV4", name: "Triệt lông vĩnh viễn (Nách)", price: 350000, duration: "30 phút", commission: 20000 },
];`
);

fs.writeFileSync('src/lib/spa-data.ts', code, 'utf8');
