import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const firebaseConfig = {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: import.meta.env.VITE_FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: import.meta.env.VITE_FIREBASE_ADMIN_PRIVATE_KEY,
};

const app = initializeApp({
    credential: cert(firebaseConfig),
    databaseURL: 'https://thaiastro-demo-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const auth = getAuth(app);

export { app, auth };
export default app;
