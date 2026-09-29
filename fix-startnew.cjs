const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const oldStartNew = `time: getNext15MinTime(),
        endTime: getNext15MinTime(60),
        customerId: "",
        serviceIds: serviceOptions.length > 0 ? [serviceOptions[0].id] : [""],`;

const newStartNew = `time: getNext15MinTime(),
        endTime: calculateEndTime(getNext15MinTime(), serviceOptions.length > 0 ? [serviceOptions[0].id] : [""], serviceOptions),
        customerId: "",
        serviceIds: serviceOptions.length > 0 ? [serviceOptions[0].id] : [""],`;

code = code.replace(oldStartNew, newStartNew);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Updated startNew");
