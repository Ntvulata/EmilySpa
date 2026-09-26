const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// fix startEdit
code = code.replace(/customer: item\.customer,/g, 'customerId: item.customerId,');
code = code.replace(/services: \[\.\.\.item\.services\],/g, 'serviceIds: [...(item.serviceIds || (item as any).services || [])],');
code = code.replace(/therapist: item\.therapist,/g, 'therapistId: item.therapistId,');

// fix new default form
code = code.replace(/customer: "",/g, 'customerId: "",');
code = code.replace(/services: serviceOptions\.length > 0 \? \[serviceOptions\[0\]\.name\] : \[""\],/g, 'serviceIds: serviceOptions.length > 0 ? [serviceOptions[0].id] : [""],');
code = code.replace(/therapist: masterTherapists\[0\]\.name,/g, 'therapistId: masterTherapists[0].id,');

// fix submit overlap check
code = code.replace(/app\.therapist !== form\.therapistId/g, 'app.therapistId !== form.therapistId');

// fix savedAppt creation
code = code.replace(/const savedAppt: Appointment = \{[\s\S]*?id: editId \|\| Date\.now\(\)\.toString\(\),[\s\S]*?date: form\.date,[\s\S]*?time: form\.time,[\s\S]*?endTime: form\.endTime,[\s\S]*?customer: form\.customerId,[\s\S]*?phone: c\?\.phone \|\| "",[\s\S]*?services: form\.serviceIds,[\s\S]*?therapist: form\.therapistId,[\s\S]*?status: form\.status,[\s\S]*?price: p,[\s\S]*?packageUsed: form\.packageUsed,[\s\S]*?sessionsDeducted: s,[\s\S]*?balanceDeducted: b[\s\S]*?\};/, `const savedAppt: Appointment = {
      id: editId || Date.now().toString(),
      date: form.date,
      time: form.time,
      endTime: form.endTime,
      customerId: form.customerId,
      phone: c?.phone || "",
      serviceIds: form.serviceIds,
      therapistId: form.therapistId,
      status: form.status,
      price: p,
      packageUsed: form.packageUsed,
      sessionsDeducted: s,
      balanceDeducted: b
    };`);

// If the regex above fails, we can just replace individual fields
code = code.replace(/customer: form\.customerId,/g, 'customerId: form.customerId,');
code = code.replace(/services: form\.serviceIds,/g, 'serviceIds: form.serviceIds,');
code = code.replace(/therapist: form\.therapistId,/g, 'therapistId: form.therapistId,');

// Re-check dropdowns in the form just to be 100% sure
code = code.replace(/setForm\(\{\.\.\.form, customer: v, packageUsed: "" \}\)/g, 'setForm({...form, customerId: v, packageUsed: "" })');

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
