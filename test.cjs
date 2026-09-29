const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const oldCheck = `if (form.packageUsed) {
      const rem = getRemainingPackageValue(form.customerId, form.packageUsed);
      if (t === "sessions" && form.status === "xong" && !editId) {
        if (s > rem) return setError(\`Thẻ này chỉ còn \${rem} buổi, không đủ để trừ \${s} buổi.\`);
      }
      if (t === "balance" && form.status === "xong" && !editId) {
        if (b > rem) return setError(\`Thẻ này chỉ còn \${formatVnd(rem)}, không đủ để trừ \${formatVnd(b)}.\`);
      }
    }`;

const newCheck = `if (form.packageUsed) {
      let rem = getRemainingPackageValue(form.customerId, form.packageUsed);
      
      if (editId) {
        const oldAppt = initialAppointments.find(x => x.id === editId);
        if (oldAppt && oldAppt.status === "xong" && oldAppt.packageUsed === form.packageUsed) {
          if (t === "sessions") rem += (oldAppt.sessionsDeducted || 0);
          if (t === "balance") rem += (oldAppt.balanceDeducted || 0);
        }
      }

      if (form.status === "xong") {
        if (t === "sessions" && s > rem) return setError(\`Thẻ này chỉ còn \${rem} buổi, không đủ để trừ \${s} buổi.\`);
        if (t === "balance" && b > rem) return setError(\`Thẻ này chỉ còn \${formatVnd(rem)}, không đủ để trừ \${formatVnd(b)}.\`);
      }
    }`;

// Wait, PowerShell might not match the raw string exactly due to UTF8 encoding of accents. Let's use Regex.
