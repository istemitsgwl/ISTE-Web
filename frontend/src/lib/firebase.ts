import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { initializeFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig)

// Export Service Clients
export const auth = getAuth(app)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
})

// Storage — may not be enabled on the Firebase project yet
let storageInstance: ReturnType<typeof getStorage> | null = null
try {
  storageInstance = getStorage(app)
} catch (e) {
  console.warn("Firebase Storage not initialized. Please enable it in the Firebase Console.")
}
export const storage = storageInstance as ReturnType<typeof getStorage>

// If VITE_USE_EMULATOR is enabled, redirect SDK connections to local offline port resources
if (import.meta.env.VITE_USE_EMULATOR === "true") {
  console.info("Firebase SDK connecting to Local Emulators (Auth: 9099, Firestore: 8080, Storage: 9199)")
  connectAuthEmulator(auth, "http://localhost:9099")
  connectFirestoreEmulator(db, "localhost", 8080)
  connectStorageEmulator(storage, "localhost", 9199)
}

export default app
