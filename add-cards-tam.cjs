const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

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

async function addPackages() {
  const customerId = "CUST_1791787314629"; // Anh Tâm - 0899729408
  const now = Date.now();

  const pkg1 = {
    id: "HT-" + now + "-1",
    date: "2026-09-30",
    customerId: customerId,
    packageId: "CUSTOM_MIGRATED_" + now + "_1",
    customName: "Triệt full mặt 1 năm HSD: 05/09/2027",
    valueChange: 9999,
    pricePaid: 0,
    type: "sell",
    note: "Chuyển đổi dữ liệu cũ (HSD: 05/09/2027)"
  };

  const pkg2 = {
    id: "HT-" + now + "-2",
    date: "2026-09-30",
    customerId: customerId,
    packageId: "CUSTOM_MIGRATED_" + now + "_2",
    customName: "Triệt 1/2 tay 1 năm HSD: 05/09/2027",
    valueChange: 9999,
    pricePaid: 0,
    type: "sell",
    note: "Chuyển đổi dữ liệu cũ (HSD: 05/09/2027)"
  };

  console.log("Saving 2 packages to packageHistory...");
  await setDoc(doc(db, "packageHistory", pkg1.id), pkg1);
  await setDoc(doc(db, "packageHistory", pkg2.id), pkg2);

  console.log("SUCCESS!");
  process.exit(0);
}

addPackages().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
