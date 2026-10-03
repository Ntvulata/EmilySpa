const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

code = code.replace(
  /fbDeleteMasterPackage, fbGetTherapists \} from "@\/lib\/firebase";/,
  'fbDeleteMasterPackage, fbGetTherapists, fbGetServices } from "@/lib/firebase";'
);

const fetchTherapistsInServices = `    fbGetTherapists().then(data => {
      if (data && data.length > 0) {
        setStaff(data);
      }
    }).catch(console.error);`;

const fetchServicesInServices = `
    fbGetServices().then(data => {
      if (data && data.length > 0) {
        setServices(data);
        serviceOptions.length = 0;
        data.forEach(d => serviceOptions.push(d));
      }
    }).catch(console.error);
`;

code = code.replace(fetchTherapistsInServices, fetchTherapistsInServices + fetchServicesInServices);

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Updated services to fetch services");
