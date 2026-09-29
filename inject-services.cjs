const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

// We need to inject fbGetTherapists
code = code.replace(
  'import { fbSaveService, fbDeleteService, fbSaveTherapist, fbDeleteTherapist, fbSaveMasterPackage, fbDeleteMasterPackage } from "@/lib/firebase";',
  'import { fbSaveService, fbDeleteService, fbSaveTherapist, fbDeleteTherapist, fbSaveMasterPackage, fbDeleteMasterPackage, fbGetTherapists } from "@/lib/firebase";'
);
// we also need to import useEffect
code = code.replace(
  'import { useState, type FormEvent } from "react";',
  'import { useState, useEffect, type FormEvent } from "react";'
);

// We need to fetch and setStaff
// Wait, staff is initialized as:
// const [staff, setStaff] = useState(therapists.map(t => ({ role: "Kỹ thuật viên", phone: "", ...t })));

const newStaffInit = `  const [staff, setStaff] = useState(therapists.map(t => ({ role: "Kỹ thuật viên", phone: "", ...t })));
  
  useEffect(() => {
    fbGetTherapists().then(data => {
      if (data && data.length > 0) {
        setStaff(data);
      }
    }).catch(console.error);
  }, []);`;

code = code.replace(
  '  const [staff, setStaff] = useState(therapists.map(t => ({ role: "Kỹ thuật viên", phone: "", ...t })));',
  newStaffInit
);

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Injected fbGetTherapists into services");
