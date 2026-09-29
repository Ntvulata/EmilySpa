const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const regex = /const submit = async \(e: FormEvent\) => \{/;
const newStart = `const submit = async (e: FormEvent) => {
    try {
      alert("Debug 1: Bắt đầu submit");
      e.preventDefault();
      
      let finalEndTime = form.endTime || form.time;
      if (form.status === "xong") {
        try {
          const now = new Date();
          const currentHHMM = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
          const localDate = \`\${now.getFullYear()}-\${(now.getMonth()+1).toString().padStart(2, '0')}-\${now.getDate().toString().padStart(2, '0')}\`;
          if (form.date === localDate) {
            if (finalEndTime > currentHHMM) finalEndTime = currentHHMM;
          }
        } catch (e) {
          console.error(e);
        }
        if (finalEndTime < form.time) finalEndTime = form.time;
      }
      
      alert("Debug 2: Tính xong finalEndTime: " + finalEndTime);

      if (!form.customerId) { alert("Thiếu khách hàng"); return setError("Vui lòng chọn khách hàng."); }
      if (finalEndTime < form.time) { alert("Lỗi thời gian"); return setError("Giờ kết thúc không được nhỏ hơn giờ bắt đầu."); }

      const hasOverlap = appts.some(app => {
        if (app.id === editId || app.status === 'huy' || app.date !== form.date || app.therapistId !== form.therapistId) return false;
        const appEndTime = app.endTime || app.time;
        return form.time < appEndTime && finalEndTime > app.time;
      });

      if (hasOverlap) { alert("Trùng lịch"); return setError("KTV này đã có lịch hẹn khác..."); }
      if (form.serviceIds.length === 0) { alert("Thiếu dịch vụ"); return setError("Vui lòng chọn ít nhất 1 dịch vụ."); }

      const p = form.price ? Number(String(form.price).replace(/\\D/g, "")) : 0;
      const s = form.sessionsDeducted ? Number(String(form.sessionsDeducted).replace(/\\D/g, "")) : 0;
      const b = form.balanceDeducted ? Number(String(form.balanceDeducted).replace(/\\D/g, "")) : 0;
      const t = getPackageType(form.packageUsed);

      alert("Debug 3: Tính toán xong p, s, b, t");

      if (form.packageUsed) {
        let rem = getRemainingPackageValue(form.customerId, form.packageUsed);
        if (editId) {
          const oldAppt = initialAppointments.find(x => x.id === editId);
          if (oldAppt && oldAppt.status === "xong" && oldAppt.packageUsed === form.packageUsed) {
            if (t === "sessions") rem += (oldAppt.sessionsDeducted || 0);
            if (t === "balance") rem += (oldAppt.balanceDeducted || 0);
          }
        }
        if (form.status === "xong") {
          if (t === "sessions" && s > rem) { alert("Thiếu buổi"); return setError(\`Thẻ này chỉ còn \${rem} buổi, không đủ để trừ \${s} buổi.\`); }
          if (t === "balance" && b > rem) { alert("Thiếu tiền"); return setError(\`Thẻ này chỉ còn \${formatVnd(rem)}, không đủ để trừ \${formatVnd(b)}.\`); }
        }
      }

      alert("Debug 4: Kiểm tra package xong. Bắt đầu tạo savedAppt");

      let savedAppt: Appointment;
      let newHistoryRecord: any = null;
      let deletedHistoryId: string | null = null;

      if (editId) {
        const oldAppt = initialAppointments.find(x => x.id === editId);
        alert("Debug 5: Sửa lịch cũ, editId=" + editId + " oldAppt_found=" + !!oldAppt);

        if (!oldAppt) { alert("KHÔNG TÌM THẤY OLD APPT"); throw new Error("Missing old appt"); }

        const isRevertingCompleted = oldAppt?.status === "xong" && form.status !== "xong";
        const isChangingDeduction = oldAppt?.status === "xong" && form.status === "xong" && oldAppt?.packageUsed && (
            oldAppt.packageUsed !== form.packageUsed || 
            oldAppt.sessionsDeducted !== s || 
            oldAppt.balanceDeducted !== b
        );
  
        if ((isRevertingCompleted || isChangingDeduction) && oldAppt?.packageUsed) {
            if (!isRevertingCompleted || window.confirm(\`Bạn có muốn HOÀN LẠI số dư/buổi cho khách không?\\nTrạng thái đổi từ 'Hoàn thành' sang '\${form.status}'\`)) {
              const toDelete = packageHistory.filter(h => h.appointmentId === editId && h.type === "deduct");
              if (toDelete.length > 0) {
                deletedHistoryId = toDelete[0].id;
                toDelete.forEach(r => {
                  const idx = packageHistory.findIndex(h => h.id === r.id);
                  if (idx !== -1) packageHistory.splice(idx, 1);
                });
              }
            }
        }
  
        savedAppt = {
            ...oldAppt,
            ...form,
            endTime: finalEndTime,
            price: p,
            sessionsDeducted: s,
            balanceDeducted: b,
            note: form.note ? String(form.note).trim() : ""
        };

        const isNewlyCompleted = oldAppt.status !== "xong" && form.status === "xong";
        if ((isNewlyCompleted || isChangingDeduction) && form.packageUsed) {
            newHistoryRecord = processPackageDeduction(
              savedAppt.id, 
              savedAppt.customerId, 
              form.packageUsed, 
              t as any, 
              savedAppt.sessionsDeducted || 0, 
              savedAppt.balanceDeducted || 0
            );
        }

        const idx = initialAppointments.findIndex(x => x.id === editId);
        if (idx !== -1) initialAppointments[idx] = savedAppt;
        setAppts([...initialAppointments]);
        setNotice("Đã cập nhật lịch hẹn.");
      } else {
        alert("Debug 5: Tạo lịch mới");
        const nextId = "LH-" + (initialAppointments.length + 2001);
        savedAppt = {
          id: nextId,
          date: form.date,
          time: form.time,
          endTime: finalEndTime,
          customerId: form.customerId,
          services: [...form.serviceIds],
          therapistId: form.therapistId,
          status: form.status,
          packageUsed: form.packageUsed,
          price: p,
          sessionsDeducted: s,
          balanceDeducted: b,
          note: form.note ? String(form.note).trim() : ""
        };

        if (form.status === "xong" && form.packageUsed) {
          newHistoryRecord = processPackageDeduction(
            savedAppt.id, 
            savedAppt.customerId, 
            form.packageUsed, 
            t as any, 
            savedAppt.sessionsDeducted || 0, 
            savedAppt.balanceDeducted || 0
          );
        }

        initialAppointments.push(savedAppt);
        setAppts([...initialAppointments]);
        setNotice("Đã thêm lịch hẹn mới.");
      }

      alert("Debug 6: Gọi Firebase");
      try {
        await fbSaveAppointmentAndHistory(savedAppt!, newHistoryRecord, deletedHistoryId);
        alert("Debug 7: Firebase lưu thành công");
      } catch (err: any) {
        alert("Firebase ERROR: " + err.message);
        console.error(err);
        setError("Lỗi lưu Cloud.");
      }
      
      setOpen(false);
    } catch (criticalError: any) {
      alert("CRASH TỔNG: " + criticalError.message + "\\n" + criticalError.stack);
    }
  };
`;

// Replace the entire submit function
// The easiest way is to slice the file
const submitStart = code.indexOf('const submit = async (e: FormEvent) => {');
const submitEndRegex = /setOpen\(false\);\n    \};/;
const match = code.match(submitEndRegex);
if (submitStart !== -1 && match) {
  const before = code.substring(0, submitStart);
  const after = code.substring(match.index + match[0].length);
  code = before + newStart + after;
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
  console.log("Rewrote submit with debug alerts");
} else {
  console.log("Could not find submit boundaries");
}
