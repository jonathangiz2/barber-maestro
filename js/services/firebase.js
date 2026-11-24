import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase,
  ref,
  get,
  set,
  remove
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

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
const auth = getAuth(app);

export function onUserChanged(callback) {
  return onAuthStateChanged(auth, callback);
}

  export async function registerUser(email, password, profile = {}) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await set(ref(db, `users/${cred.user.uid}`), {
      ...profile,
      createdAt: new Date().toISOString()
    });
    return cred;
  }

  export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  export function logoutUser() {
    return signOut(auth);
  }

  export function getCurrentUser() {
    return auth.currentUser;
  }

  export async function getBookedSlots(date) {
    const snapshot = await get(ref(db, `bookings/${date}`));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map((key) => key.replace('-', ':'));
  }

  export async function saveBooking({ date, time, service, name, phone, userId, userEmail }) {
    const timeKey = time.replace(':', '-');
    const slotRef = ref(db, `bookings/${date}/${timeKey}`);

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
      userId,
      userEmail,
      paid: false,
      createdAt: new Date().toISOString()
    });
  }

  export async function getUserBookings(userId) {
    const snapshot = await get(ref(db, 'bookings'));
    if (!snapshot.exists()) return [];

    const allDates = snapshot.val();
    const userBookings = [];

    for (const [date, slots] of Object.entries(allDates)) {
      for (const [timeKey, booking] of Object.entries(slots)) {
        if (booking.userId === userId) {
          userBookings.push({ ...booking, timeKey });
        }
      }
    }

    return userBookings.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }

  export async function cancelBooking(date, time) {
    const timeKey = time.replace(':', '-');
    await remove(ref(db, `bookings/${date}/${timeKey}`));
  }
