import { create } from 'zustand'

export interface UserProfile {
  id: string
  uid?: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'user'
  phone?: string
  college?: string
  branch?: string
  year?: string
  enrollmentNo?: string
  picture?: string
  token?: string
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  googleLogin: (idToken: string) => Promise<void>
  adminDirectLogin: (email: string) => Promise<void>
  logout: () => void
  setAuth: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
}

const LOCAL_STORAGE_KEY = 'iste_admin_jwt_token'
const LOCAL_USER_KEY = 'iste_admin_user_profile'

// Restore session from localStorage if present
const getSavedToken = (): string | null => localStorage.getItem(LOCAL_STORAGE_KEY)
const getSavedUser = (): UserProfile | null => {
  const data = localStorage.getItem(LOCAL_USER_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = getSavedToken()
  const initialUser = getSavedUser()

  return {
    user: initialUser,
    loading: false,
    isAuthenticated: !!(initialToken && initialUser),

    googleLogin: async (idToken: string) => {
      set({ loading: true })
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id_token: idToken })
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || 'Authorization failed. Unregistered Google account.')
        }

        const data = await res.json()
        const userProfile: UserProfile = {
          ...data.user,
          token: data.access_token
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, data.access_token)
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile))

        set({
          user: userProfile,
          isAuthenticated: true,
          loading: false
        })
      } catch (error) {
        set({ loading: false })
        throw error
      }
    },

    adminDirectLogin: async (email: string) => {
      set({ loading: true })
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/admin-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || 'Authorization failed. Account not listed as an active admin.')
        }

        const data = await res.json()
        const userProfile: UserProfile = {
          ...data.user,
          token: data.access_token
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, data.access_token)
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile))

        set({
          user: userProfile,
          isAuthenticated: true,
          loading: false
        })
      } catch (error) {
        set({ loading: false })
        throw error
      }
    },

    logout: () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      localStorage.removeItem(LOCAL_USER_KEY)
      set({ user: null, isAuthenticated: false, loading: false })
    },

    setAuth: (user) => {
      if (user && user.token) {
        localStorage.setItem(LOCAL_STORAGE_KEY, user.token)
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
        localStorage.removeItem(LOCAL_USER_KEY)
      }
      set({ user, isAuthenticated: !!user })
    },

    setLoading: (loading) => set({ loading })
  }
})
