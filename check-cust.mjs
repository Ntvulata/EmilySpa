import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function check() {
  const custSnap = await getDocs(collection(db, "customers"));
  let bad = [];
  custSnap.forEach(d => {
    const c = d.data();
    if (typeof c.name !== 'string' || typeof c.phone !== 'string') {
       bad.push(c);
    }
  });
  console.log("Bad customers:", bad.length, bad);
}
check().catch(console.error);
