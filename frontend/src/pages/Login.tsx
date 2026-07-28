import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import { motion, AnimatePresence } from "framer-motion"
import { User, Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import isteStandaloneLogo from "@/assets/iste-standalone-logo.png"
import isteStandaloneLogoLight from "@/assets/iste-standalone-logo-light.png"

export default function Login() {
  const navigate = useNavigate()
  const { login, registerUser, resetPassword } = useAuthStore()
  const { theme } = useTheme()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!")
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await registerUser(formData.email, formData.password, formData.name)
      }
      navigate("/")
    } catch (error: any) {
      console.error("Auth action failed:", error)
      alert(error?.message || "Authentication transaction failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const credentials = await signInWithPopup(auth, provider)
      const firebaseUser = credentials.user

      const userRef = doc(db, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        const role = (firebaseUser.email === 'shivampatidar780@gmail.com' || firebaseUser.email?.includes('admin')) ? 'admin' : 'user'
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Google User',
          role: role,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
      navigate("/")
    } catch (error: any) {
      console.error("Google Auth failed:", error)
      alert(error?.message || "Google login failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert("Please enter your email address to reset password.")
      return
    }
    try {
      await resetPassword(formData.email)
      alert("Password reset instructions sent to your email.")
    } catch (error: any) {
      alert(error?.message || "Failed to send reset email.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const activeLogo = theme === 'dark' ? isteStandaloneLogo : isteStandaloneLogoLight

  return (
    <div className="min-h-screen bg-background text-foreground relative flex items-center justify-center px-4 sm:px-6 pt-28 pb-16 transition-colors duration-300 overflow-hidden select-none">
      {/* Background Animated Glows & Orbs */}
      <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-[#CF9FFF]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[15%] right-[20%] w-[450px] h-[450px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Main Card */}
        <div className="glass-panel p-7 sm:p-10 rounded-[28px] border border-[#CF9FFF]/20 dark:border-[#CF9FFF]/30 bg-card/70 dark:bg-card/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(207,159,255,0.08)] relative overflow-hidden transition-all duration-300">
          
          {/* Subtle top inner highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#CF9FFF]/50 to-transparent" />

          {/* Logo Section */}
          <div className="text-center flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative w-20 h-20 mb-5 flex items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border border-[#CF9FFF]/30 shadow-[0_0_25px_rgba(207,159,255,0.25)]"
            >
              <img
                src={activeLogo}
                alt="ISTE MITS Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(207,159,255,0.4)]"
              />
            </motion.div>

            {/* Pill Badge */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="px-4 py-1.5 rounded-full bg-primary/10 dark:bg-[#CF9FFF]/15 border border-primary/20 dark:border-[#CF9FFF]/30 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-primary dark:text-[#CF9FFF] shadow-[0_0_15px_rgba(207,159,255,0.15)] flex items-center gap-1.5 mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#CF9FFF]" />
              ISTE Student's Chapter MITS DU
            </motion.span>

            {/* Heading & Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-2xl sm:text-3xl font-extrabold font-serif text-foreground tracking-tight"
            >
              {isLogin ? "Welcome Back" : "Create Account"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-xs text-muted-foreground mt-2 font-medium max-w-xs leading-relaxed"
            >
              {isLogin
                ? "Sign in to access your ISTE Student Chapter dashboard, events, registrations, and resources."
                : "Create your account to access ISTE MITS flagship events, hackathons, and member resources."
              }
            </motion.p>
          </div>

          {/* Social Provider Login */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mb-6"
          >
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-border/80 dark:border-[#CF9FFF]/20 bg-card hover:bg-muted/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_25px_rgba(207,159,255,0.1)] cursor-pointer group"
            >
              <svg className="w-4.5 h-4.5 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center my-6"
          >
            <div className="flex-grow border-t border-border/40"></div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70 mx-4">or continue with email</span>
            <div className="flex-grow border-t border-border/40"></div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-1.5 relative overflow-hidden"
                >
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#CF9FFF] transition-colors" />
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-muted/30 dark:bg-slate-900/60 border border-border/80 dark:border-border/60 focus:border-[#CF9FFF] focus:ring-2 focus:ring-[#CF9FFF]/20 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm font-medium transition-all duration-300 outline-none text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col gap-1.5"
            >
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#CF9FFF] transition-colors" />
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@domain.com"
                  className="w-full bg-muted/30 dark:bg-slate-900/60 border border-border/80 dark:border-border/60 focus:border-[#CF9FFF] focus:ring-2 focus:ring-[#CF9FFF]/20 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm font-medium transition-all duration-300 outline-none text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-primary hover:text-[#CF9FFF] transition-colors font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#CF9FFF] transition-colors" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-muted/30 dark:bg-slate-900/60 border border-border/80 dark:border-border/60 focus:border-[#CF9FFF] focus:ring-2 focus:ring-[#CF9FFF]/20 rounded-2xl pl-11 pr-10 py-3.5 text-xs sm:text-sm font-medium transition-all duration-300 outline-none text-foreground placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password Field (Register Mode) */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-1.5 relative overflow-hidden"
                >
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#CF9FFF] transition-colors" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-muted/30 dark:bg-slate-900/60 border border-border/80 dark:border-border/60 focus:border-[#CF9FFF] focus:ring-2 focus:ring-[#CF9FFF]/20 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm font-medium transition-all duration-300 outline-none text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-[#CF9FFF] via-primary to-[#7F00FF] hover:from-[#d8b4ff] hover:to-[#8f1aff] text-slate-950 shadow-[0_0_25px_rgba(207,159,255,0.35)] hover:shadow-[0_0_35px_rgba(207,159,255,0.55)] transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:pointer-events-none relative overflow-hidden group"
            >
              {/* Shine Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle Mode Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-border/40 text-center"
          >
            <p className="text-xs text-muted-foreground font-medium">
              {isLogin ? "New to ISTE MITS?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary dark:text-[#CF9FFF] hover:underline font-extrabold focus:outline-none cursor-pointer ml-1"
              >
                {isLogin ? "Create an account" : "Sign in to account"}
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
