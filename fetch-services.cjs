const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /import \{ fbSaveAppointment, fbSaveAppointmentAndHistory, fbDeleteAppointment, fbGetTherapists \} from "@\/lib\/firebase";/,
  'import { fbSaveAppointment, fbSaveAppointmentAndHistory, fbDeleteAppointment, fbGetTherapists, fbGetServices } from "@/lib/firebase";'
);

const fetchTherapists = `    fbGetTherapists().then(data => {
      if (data && data.length > 0) {
        setDbTherapists(data);
      } else {
        setDbTherapists(masterTherapists);
      }
    }).catch(console.error);`;

const fetchServices = `
    fbGetServices().then(data => {
      if (data && data.length > 0) {
        serviceOptions.length = 0; // Clear the hardcoded options
        data.forEach(d => serviceOptions.push(d));
        setTick(t => t + 1); // Trigger re-render
      }
    }).catch(console.error);
`;

code = code.replace(fetchTherapists, fetchTherapists + fetchServices);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Updated appointments to fetch services");
