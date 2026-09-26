import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwhkFNT3TALvvhVL6jerA70XiTeqwBjEw",
  authDomain: "emily-spa.firebaseapp.com",
  projectId: "emily-spa",
  storageBucket: "emily-spa.firebasestorage.app",
  messagingSenderId: "496385289916",
  appId: "1:496385289916:web:726d968e129906c465aab9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAdmin() {
  await setDoc(doc(db, "users", "admin"), { username: "admin", password: "123" });
  console.log("Admin user added");
}
addAdmin();
