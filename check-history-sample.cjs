const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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
  const snap = await getDocs(collection(db, "packageHistory"));
  const records = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log("Total packageHistory records:", records.length);
  const sample = records.filter(r => r.note && (r.note.includes("Chuyển đổi") || r.note.includes("thẻ tồn") || r.note.includes("HSD") || r.note.includes("9999") || r.valueChange === 9999));
  console.log("Matching sample:", JSON.stringify(sample.slice(0, 10), null, 2));
  process.exit(0);
}

run();
