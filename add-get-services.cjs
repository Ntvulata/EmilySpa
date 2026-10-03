const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  /export const fbGetTherapists = async \(\) => {/,
  `export const fbGetServices = async () => {
  const snap = await getDocs(collection(db, "services"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const fbGetTherapists = async () => {`
);

fs.writeFileSync('src/lib/firebase.ts', code, 'utf8');
console.log("Added fbGetServices");
