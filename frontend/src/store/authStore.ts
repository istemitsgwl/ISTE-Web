import { create } from 'zustand'
import { auth, db } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: 'user' | 'admin'
  phone?: string
  college?: string
  branch?: string
  year?: string
  enrollmentNo?: string
  token?: string
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  registerUser: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setAuth: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
}

let unsubscribeAuthListener: (() => void) | null = null

export const useAuthStore = create<AuthState>((set) => {
  // Listen to Firebase Auth changes in real time (singleton listener to prevent duplicate subscriptions)
  if (!unsubscribeAuthListener) {
    unsubscribeAuthListener = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let token = ''
        try {
          token = await getIdToken(firebaseUser)
        } catch (tErr) {
          console.warn("Could not retrieve auth ID token:", tErr)
        }

        try {
          // Fetch custom user profile details from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userRef)
          
          if (userDoc.exists()) {
            const profile = userDoc.data()
            set({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: profile.name || '',
                role: profile.role || 'user',
                phone: profile.phone,
                college: profile.college,
                branch: profile.branch,
                year: profile.year,
                enrollmentNo: profile.enrollmentNo,
                token
              },
              isAuthenticated: true,
              loading: false
            })
          } else {
            // If Firestore document doesn't exist, create a fallback
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: (firebaseUser.email?.includes('admin') || firebaseUser.email === 'shivampatidar780@gmail.com') ? 'admin' : 'user',
              token
            }
            set({ user: profile, isAuthenticated: true, loading: false })
          }
        } catch (err) {
          console.warn("Firestore profile sync warning (network/ad-blocker restriction):", err)
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.email?.split('@')[0] || 'User',
              role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
              token
            },
            isAuthenticated: true,
            loading: false
          })
        }
      } else {
        set({ user: null, isAuthenticated: false, loading: false })
      }
    })
  }

  return {
    user: null,
    loading: true,
    isAuthenticated: false,
    
    login: async (email, password) => {
      set({ loading: true })
      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (error) {
        set({ loading: false })
        throw error
      }
    },
    
    registerUser: async (email, password, name) => {
      set({ loading: true })
      try {
        const credentials = await createUserWithEmailAndPassword(auth, email, password)
        const uid = credentials.user.uid
        
        // Create initial Firestore user document
        const userRef = doc(db, 'users', uid)
        const role = (email.includes('admin') || email === 'shivampatidar780@gmail.com') ? 'admin' : 'user'
        
        await setDoc(userRef, {
          uid,
          email,
          name,
          role,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      } catch (error) {
        set({ loading: false })
        throw error
      }
    },
    
    logout: async () => {
      set({ loading: true })
      await signOut(auth)
      set({ user: null, isAuthenticated: false, loading: false })
    },
    
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email)
    },
    
    setAuth: (user) => set({ user, isAuthenticated: !!user }),
    setLoading: (loading) => set({ loading })
  }
})
