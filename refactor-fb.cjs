const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(/export const fbSaveCustomer = async \(cust: Customer\) => \{[\s\S]*?await setDoc\(doc\(db, "customers", cust\.phone\), cust\);/g, `export const fbSaveCustomer = async (cust: Customer) => {\n  await setDoc(doc(db, "customers", cust.id), cust);`);
code = code.replace(/export const fbDeleteCustomer = async \(phone: string\) => \{[\s\S]*?await deleteDoc\(doc\(db, "customers", phone\)\);/g, `export const fbDeleteCustomer = async (id: string) => {\n  await deleteDoc(doc(db, "customers", id));`);
code = code.replace(/export const fbSaveService = async \(service: any\) => \{[\s\S]*?await setDoc\(doc\(db, "services", service\.name\), service\);/g, `export const fbSaveService = async (service: any) => {\n  await setDoc(doc(db, "services", service.id), service);`);
code = code.replace(/export const fbDeleteService = async \(name: string\) => \{[\s\S]*?await deleteDoc\(doc\(db, "services", name\)\);/g, `export const fbDeleteService = async (id: string) => {\n  await deleteDoc(doc(db, "services", id));`);
code = code.replace(/export const fbSaveTherapist = async \(therapist: any\) => \{[\s\S]*?await setDoc\(doc\(db, "therapists", therapist\.name\), therapist\);/g, `export const fbSaveTherapist = async (therapist: any) => {\n  await setDoc(doc(db, "therapists", therapist.id), therapist);`);
code = code.replace(/export const fbDeleteTherapist = async \(name: string\) => \{[\s\S]*?await deleteDoc\(doc\(db, "therapists", name\)\);/g, `export const fbDeleteTherapist = async (id: string) => {\n  await deleteDoc(doc(db, "therapists", id));`);

fs.writeFileSync('src/lib/firebase.ts', code, 'utf8');
console.log("Firebase TS updated");
