const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const startStr = "const submit = async (e: FormEvent) => {";
const endStr = "setOpen(false);\n    };";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newSubmit = `const submit = async (e: FormEvent) => {
    try {
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

      if (!form.customerId) { alert("Vui lòng chọn khách hàng."); return; }
      if (finalEndTime < form.time) { alert("Giờ kết thúc không được nhỏ hơn giờ bắt đầu."); return; }

      const hasOverlap = appts.some(app => {
        if (app.id === editId || app.status === 'huy' || app.date !== form.date || app.therapistId !== form.therapistId) return false;
        const appEndTime = app.endTime || app.time;
        return form.time < appEndTime && finalEndTime > app.time;
      });

      if (hasOverlap) { alert("KTV này đã có lịch hẹn khác trong khoảng thời gian này!"); return; }
      if (form.serviceIds.length === 0) { alert("Vui lòng chọn ít nhất 1 dịch vụ."); return; }

      const p = form.price ? Number(String(form.price).replace(/\\D/g, "")) : 0;
      const s = form.sessionsDeducted ? Number(String(form.sessionsDeducted).replace(/\\D/g, "")) : 0;
      const b = form.balanceDeducted ? Number(String(form.balanceDeducted).replace(/\\D/g, "")) : 0;
      const t = getPackageType(form.packageUsed);

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
          if (t === "sessions" && s > rem) { alert(\`Thẻ này chỉ còn \${rem} buổi, không đủ để trừ \${s} buổi.\`); return; }
          if (t === "balance" && b > rem) { alert(\`Thẻ này chỉ còn \${formatVnd(rem)}, không đủ để trừ \${formatVnd(b)}.\`); return; }
        }
      }

      let savedAppt: Appointment;
      let newHistoryRecord: any = null;
      let deletedHistoryId: string | null = null;

      if (editId) {
        const oldAppt = initialAppointments.find(x => x.id === editId);

        if (!oldAppt) { alert("Lỗi: Không tìm thấy lịch hẹn cũ để cập nhật."); return; }

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

      try {
        await fbSaveAppointmentAndHistory(savedAppt, newHistoryRecord, deletedHistoryId);
      } catch (err: any) {
        alert("Lỗi lưu Cloud: " + err.message);
        console.error(err);
      }
      
      setOpen(false);
    } catch (criticalError: any) {
      alert("Lỗi kĩ thuật: " + criticalError.message);
    }
  };`;

  code = code.substring(0, startIdx) + newSubmit + code.substring(endIdx + endStr.length);
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
  console.log("Successfully replaced submit block via substring");
} else {
  console.log("Could not find start/end markers");
}
