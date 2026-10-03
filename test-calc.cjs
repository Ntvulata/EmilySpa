const serviceOptions = [
    { id: "SRV1", name: "Chăm sóc da", price: 800000, duration: "90 phút", commission: 50000 },
];
function calculateEndTime(startTime, services, serviceOptions) {
    if (!startTime) return "";
    let totalMinutes = 0;
    services.forEach(id => {
      const s = serviceOptions.find(opt => opt.id === id);
      if (s && s.duration) {
        const parsed = parseInt(s.duration.replace(/\D/g, ""));
        if (!isNaN(parsed)) totalMinutes += parsed;
      }
    });
    if (totalMinutes === 0) return startTime;
    
    const [h, m] = startTime.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + totalMinutes, 0, 0);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

console.log(calculateEndTime("08:30", ["SRV1"], serviceOptions));
console.log(calculateEndTime("08:30", ["NOT_FOUND"], serviceOptions));
