const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBwhkFNT3TALvvhVL6jerA70XiTeqwBjEw",
  authDomain: "emily-spa.firebaseapp.com",
  projectId: "emily-spa",
  storageBucket: "emily-spa.firebasestorage.app",
  messagingSenderId: "496385289916",
  appId: "1:496385289916:web:726d968e129906c465aab9",
  measurementId: "G-Q96ZWHK0WW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching customers...");
  const custSnap = await getDocs(collection(db, "customers"));
  const customers = custSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const match = customers.filter(c => (c.phone && c.phone.includes("0899729408")) || (c.name && c.name.toLowerCase().includes("tâm")));
  console.log("Matching customers:", JSON.stringify(match, null, 2));

  console.log("Fetching services...");
  const srvSnap = await getDocs(collection(db, "services"));
  const services = srvSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log("Services count:", services.length);
  const trietServices = services.filter(s => s.name && s.name.toLowerCase().includes("triệt"));
  console.log("Triet services:", JSON.stringify(trietServices, null, 2));

  console.log("Fetching master packages...");
  const pkgSnap = await getDocs(collection(db, "masterPackages"));
  const packages = pkgSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log("Master packages:", JSON.stringify(packages, null, 2));

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
