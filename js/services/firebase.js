import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, get, set } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCeE8PVv5YEbjvv0DdRAxYBM_DdsKoKQ_8',
  authDomain: 'barberia-maestro-b439d.firebaseapp.com',
  databaseURL: 'https://barberia-maestro-b439d-default-rtdb.europe-west1.firebasedatabase.app/',
  projectId: 'barberia-maestro-b439d',
  storageBucket: 'barberia-maestro-b439d.firebasestorage.app',
  messagingSenderId: '322215744622',
  appId: '1:322215744622:web:5a67a5c66af546d1fb427f'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export async function getBookedSlots(date) {
  const snapshot = await get(ref(db, `bookings/${date}`));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map((key) => key.replace('-', ':'));
}

export async function saveBooking({ date, time, service, name, phone }) {
  const timeKey = time.replace(':', '-');
  const slotRef = ref(db, `bookings/${date}/${timeKey}`);

  // Prevent duplicate bookings
  const existing = await get(slotRef);
  if (existing.exists()) {
    throw new Error('SLOT_TAKEN');
  }

  await set(slotRef, {
    service,
    name,
    phone,
    date,
    time,
    createdAt: new Date().toISOString()
  });
}
