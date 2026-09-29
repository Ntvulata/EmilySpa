import { readFileSync } from 'fs';
import { db } from './src/lib/firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

async function upload() {
  const text = readFileSync('dich-vu-mau (2).csv', 'utf8');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const snap = await getDocs(collection(db, "services"));
  const existingNames = new Set<string>();
  snap.forEach(d => existingNames.add(d.data().name.toLowerCase()));
  console.log("Existing services count:", existingNames.size);
  
  let added = 0;
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 3) {
      const name = parts[0].trim();
      if (!name) continue;
      
      const durationNum = Number(parts[1].trim());
      const price = Number(parts[2].trim());
      const commissionStr = parts.length >= 4 ? parts[3].trim() : '';
      const commission = commissionStr ? Number(commissionStr) : 0;
      
      if (!existingNames.has(name.toLowerCase())) {
        const id = "SRV_" + Date.now() + Math.random().toString(36).substr(2, 5);
        const service = {
          id,
          name,
          duration: `${durationNum} phút`,
          price: isNaN(price) ? 0 : price,
          commission: isNaN(commission) ? 0 : commission
        };
        await setDoc(doc(db, "services", id), service);
        existingNames.add(name.toLowerCase());
        console.log("Added:", name);
        added++;
      } else {
        console.log("Skipped (Duplicate):", name);
      }
    }
  }
  console.log("Finished. Total added:", added);
  process.exit(0);
}
upload().catch(console.error);
