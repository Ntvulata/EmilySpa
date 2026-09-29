const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const newFunc = `export const fbGetTherapists = async () => {
  const snap = await getDocs(collection(db, "therapists"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};`;

code += '\n' + newFunc + '\n';
fs.writeFileSync('src/lib/firebase.ts', code, 'utf8');
console.log("Added fbGetTherapists");
