import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs,
  getDoc,
  setDoc, 
  doc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { appointments, initialCustomers, packageHistory, serviceOptions, therapists, masterPackages, Customer, Appointment, PackageHistoryRecord } from "./spa-data";

const firebaseConfig = {
  apiKey: "AIzaSyBwhkFNT3TALvvhVL6jerA70XiTeqwBjEw",
  authDomain: "emily-spa.firebaseapp.com",
  projectId: "emily-spa",
  storageBucket: "emily-spa.firebasestorage.app",
  messagingSenderId: "496385289916",
  appId: "1:496385289916:web:726d968e129906c465aab9",
  measurementId: "G-Q96ZWHK0WW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- Sync Functions ---

// 1. Initial Load: Fetch everything from Firestore and populate local arrays
export const fetchInitialData = async () => {
  try {
    const [apptsSnap, custsSnap, pkgsSnap, servicesSnap, therapistsSnap, masterPkgsSnap] = await Promise.all([
      getDocs(collection(db, "appointments")),
      getDocs(collection(db, "customers")),
      getDocs(collection(db, "packageHistory")),
      getDocs(collection(db, "services")),
      getDocs(collection(db, "therapists")),
      getDocs(collection(db, "masterPackages"))
    ]);

    // If completely empty, we can choose to seed it or leave it empty.
    // We will leave it empty as this is production data for the user.
    // Just clear the mock arrays and push real data (which might be 0 items)
    appointments.length = 0;
    apptsSnap.forEach(doc => appointments.push(doc.data() as Appointment));

    initialCustomers.length = 0;
    custsSnap.forEach(doc => initialCustomers.push(doc.data() as Customer));

    packageHistory.length = 0;
    pkgsSnap.forEach(doc => packageHistory.push(doc.data() as PackageHistoryRecord));

    serviceOptions.length = 0;
    servicesSnap.forEach(doc => serviceOptions.push(doc.data()));

    therapists.length = 0;
    therapistsSnap.forEach(doc => therapists.push(doc.data()));

    masterPackages.length = 0;
    masterPkgsSnap.forEach(doc => masterPackages.push(doc.data()));

    return true;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu từ Firebase:", error);
    return false;
  }
};

// 2. Helpers to update Firestore

export const fbSaveAppointment = async (appt: Appointment) => {
  await setDoc(doc(db, "appointments", appt.id), appt);
};

export const fbDeleteAppointment = async (id: string) => {
  await deleteDoc(doc(db, "appointments", id));
};

export const fbSaveCustomer = async (cust: Customer) => {
  await setDoc(doc(db, "customers", cust.id), cust);
};

export const fbDeleteCustomer = async (id: string) => {
  await deleteDoc(doc(db, "customers", id));
};

export const fbSavePackageHistory = async (record: PackageHistoryRecord) => {
  await setDoc(doc(db, "packageHistory", record.id), record);
};

export const fbDeletePackageHistory = async (id: string) => {
  await deleteDoc(doc(db, "packageHistory", id));
};

// Helper for when completing an appointment deducts a package
// We want to save both the appointment update AND the new deduction history record atomically
export const fbSaveAppointmentAndHistory = async (appt: Appointment, record: PackageHistoryRecord | null, deletedRecordId: string | string[] | null) => {
  const batch = writeBatch(db);
  
  const apptRef = doc(db, "appointments", appt.id);
  batch.set(apptRef, appt);

  if (record) {
    const recRef = doc(db, "packageHistory", record.id);
    batch.set(recRef, record);
  }

  if (deletedRecordId) {
    const ids = Array.isArray(deletedRecordId) ? deletedRecordId : [deletedRecordId];
    for (const id of ids) {
      const delRef = doc(db, "packageHistory", id);
      batch.delete(delRef);
    }
  }

  await batch.commit();
};

export const fbGetSettings = async () => {
  try {
    const docSnap = await getDoc(doc(db, "settings", "spaInfo"));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Error getting settings:", error);
  }
  return null;
};

export const fbSaveSettings = async (data: any) => {
  await setDoc(doc(db, "settings", "spaInfo"), data);
};

export const fbSaveService = async (service: any) => {
  await setDoc(doc(db, "services", service.id), service);
};
export const fbDeleteService = async (id: string) => {
  await deleteDoc(doc(db, "services", id));
};
export const fbSaveTherapist = async (therapist: any) => {
  await setDoc(doc(db, "therapists", therapist.id), therapist);
};
export const fbDeleteTherapist = async (id: string) => {
  await deleteDoc(doc(db, "therapists", id));
};
export const fbSaveMasterPackage = async (pkg: any) => {
  await setDoc(doc(db, "masterPackages", pkg.id), pkg);
};
export const fbDeleteMasterPackage = async (id: string) => {
  await deleteDoc(doc(db, "masterPackages", id));
};
export const fbGetUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const fbSaveUser = async (user: any) => {
  await setDoc(doc(db, "users", user.username), user);
};
export const fbDeleteUser = async (username: string) => {
  await deleteDoc(doc(db, "users", username));
};
