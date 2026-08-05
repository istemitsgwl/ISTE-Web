import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import { motion } from "framer-motion"
import { Shield, Sparkles, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import isteStandaloneLogo from "@/assets/iste-standalone-logo.png"
import isteStandaloneLogoLight from "@/assets/iste-standalone-logo-light.png"

declare global {
  interface Window {
    google?: any
    __google_gsi_initialized?: boolean
  }
}

export default function Login() {
  const navigate = useNavigate()
  const { googleLogin, adminDirectLogin, user, isAuthenticated } = useAuthStore()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [loginMode, setLoginMode] = useState<"direct" | "google">("direct")
  const [adminEmail, setAdminEmail] = useState("shivampatidar780@gmail.com")

  useEffect(() => {
    if (isAuthenticated && user && (user.role === "super_admin" || user.role === "admin")) {
      navigate("/admin/dashboard")
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    let active = true
    const initGoogleSignIn = () => {
      if (!active) return
      if (window.google?.accounts?.id) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1009258419935-1dgi30dfn1ev51v3gs4145cu26ibclmq.apps.googleusercontent.com"
        if (!window.__google_gsi_initialized) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response.credential) {
                setLoading(true)
                setErrorMessage("")
                try {
                  await googleLogin(response.credential)
                  navigate("/admin/dashboard")
                } catch (err: any) {
                  setErrorMessage(err?.message || "403 Unauthorized: Unregistered or disabled Google Admin account.")
                } finally {
                  setLoading(false)
                }
              }
            }
          })
          window.__google_gsi_initialized = true
        }
        const btnElement = document.getElementById("google-signin-btn")
        if (btnElement && btnElement.children.length === 0) {
          window.google.accounts.id.renderButton(btnElement, {
            theme: "outline",
            size: "large",
            width: "360",
            text: "continue_with"
          })
        }
      } else {
        setTimeout(initGoogleSignIn, 150)
      }
    }

    const scriptId = "google-gsi-script"
    let script = document.getElementById(scriptId) as HTMLScriptElement
    if (!script) {
      script = document.createElement("script")
      script.id = scriptId
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = initGoogleSignIn
      document.body.appendChild(script)
    } else {
      initGoogleSignIn()
    }

    return () => {
      active = false
    }
  }, [googleLogin, navigate])

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminEmail.trim()) {
      setErrorMessage("Please enter a valid admin email address.")
      return
    }
    setLoading(true)
    setErrorMessage("")
    try {
      await adminDirectLogin(adminEmail)
      navigate("/admin/dashboard")
    } catch (err: any) {
      setErrorMessage(err?.message || "Login failed. Verify email authorization.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-background selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* 1. Grid Tech Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none" />
      
      {/* 2. Slow Motion Mesh Gradient & Animated Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-primary/15 to-secondary/5 dark:from-primary/10 dark:to-transparent blur-[140px] mix-blend-screen pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-cyan-500/10 to-indigo-500/5 blur-[120px] mix-blend-screen pointer-events-none animate-pulse duration-[12000ms] delay-2000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/5 rounded-3xl blur-[40px] -z-10 pointer-events-none" />

        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 dark:border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-2xl group hover:border-primary/30 transition-all duration-500">
          
          <div className="flex flex-col items-center text-center mb-6 relative z-10">
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center p-3 mb-5 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
              <img
                src={theme === "light" ? isteStandaloneLogoLight : isteStandaloneLogo}
                alt="ISTE Logo"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-black uppercase tracking-widest text-primary mb-3">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Administrative Gateway</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-foreground">
              ISTE MITS Admin Portal
            </h1>
            <p className="text-[11px] text-muted-foreground mt-1.5 max-w-xs font-medium">
              Authorized login portal for Super Admin & Chapter Leadership.
            </p>
          </div>

          {/* Authentication Mode Switcher */}
          <div className="flex rounded-xl bg-muted/30 p-1 mb-6 border border-border/40 relative z-10">
            <button
              type="button"
              onClick={() => { setLoginMode("direct"); setErrorMessage(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === "direct"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin Access
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode("google"); setErrorMessage(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === "google"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Google Auth
            </button>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Direct Admin Login Form */}
          {loginMode === "direct" ? (
            <form onSubmit={handleDirectLogin} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-1.5">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="shivampatidar780@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:brightness-110 shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating Admin...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Google Sign-In Container */
            <div className="flex flex-col items-center justify-center min-h-[50px] w-full relative z-10">
              {loading ? (
                <div className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-full bg-primary/5 border border-primary/20 text-xs font-bold text-primary animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Verifying Google Token...</span>
                </div>
              ) : (
                <div id="google-signin-btn" className="w-full flex justify-center z-30 pointer-events-auto rounded-xl overflow-hidden" />
              )}
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-8 text-center pt-6 border-t border-border/40 relative z-10">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Restricted Gateway
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[280px] mx-auto">
              Super Admin & Authorized Admins of ISTE MITS Gwalior only.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
