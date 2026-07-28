import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/context/ThemeContext"
import isteStandaloneLogo from "@/assets/iste-standalone-logo.png"
import isteStandaloneLogoLight from "@/assets/iste-standalone-logo-light.png"

export default function Preloader() {
  const { theme } = useTheme()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Initializing Experience...")
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer)
          setTimeout(() => setVisible(false), 800) // Hold at 100% for 800ms before smooth fade
          return 100
        }
        
        const next = old + Math.floor(Math.random() * 3) + 2
        const actual = Math.min(next, 100)
        
        if (actual < 30) {
          setStatus("Initializing Experience...")
        } else if (actual < 60) {
          setStatus("Loading Assets...")
        } else if (actual < 85) {
          setStatus("Preparing Interface...")
        } else {
          setStatus("Welcome to ISTE MITS...")
        }
        
        return actual
      })
    }, 65)

    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-[#07111F] dark:bg-[#07111F] [.light_&]:bg-[#F7F4EE] flex flex-col items-center justify-center text-foreground px-4 overflow-hidden select-none"
        >
          {/* Subtle Background Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none radial-glow" />

          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 grid-overlay pointer-events-none opacity-25 z-0" />

          {/* Floating Subtle Ambient Particles */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[20%] left-[20%] w-2 h-2 rounded-full bg-primary/30 blur-[1px] animate-pulse" />
            <div className="absolute top-[70%] right-[25%] w-1.5 h-1.5 rounded-full bg-secondary/30 blur-[1px] animate-pulse" />
            <div className="absolute bottom-[30%] left-[35%] w-2 h-2 rounded-full bg-primary/20 blur-[1px] animate-pulse" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
            
            {/* 1. Standalone Brand Logo with Pulsing Glow & Rotation Entrance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, rotate: -8 }}
              animate={{ opacity: 1, scale: 1.0, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-6 group"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <img
                src={theme === "dark" ? isteStandaloneLogo : isteStandaloneLogoLight}
                alt="ISTE Logo"
                className="relative h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_0_20px_rgba(207,159,255,0.4)]"
              />
            </motion.div>

            {/* 2. Premium Typography Stack */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center mb-8"
            >
              {/* Title */}
              <h1 
                style={{ fontFamily: "'Anton', sans-serif" }}
                className="text-3xl sm:text-4xl tracking-wider text-[#CF9FFF] dark:text-[#CF9FFF] [.light_&]:text-[#7F00FF] drop-shadow-[0_0_12px_rgba(207,159,255,0.3)] mb-1"
              >
                ISTE MITS
              </h1>

              {/* Organization Name */}
              <p className="text-xs sm:text-sm font-medium text-foreground/80 tracking-wide mb-1">
                Indian Society for Technical Education
              </p>

              {/* Chapter Info */}
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.18em]">
                Students' Chapter • MITS Gwalior
              </p>
            </motion.div>

            {/* 3. Progress Bar & Micro-copy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[260px] sm:max-w-[300px] flex flex-col items-center gap-2.5"
            >
              {/* Progress Track */}
              <div className="w-full h-1.5 bg-slate-900/60 dark:bg-slate-950/80 border border-white/10 [.light_&]:border-black/10 rounded-full overflow-hidden relative shadow-inner">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
                  className="h-full bg-gradient-to-r from-[#CF9FFF] via-[#9B8CFF] to-[#7F00FF] relative rounded-full"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-white/20 animate-[pulse_1.5s_infinite]" />
                </motion.div>
              </div>

              {/* Status Message & Percentage */}
              <div className="w-full flex items-center justify-between text-[11px] font-medium text-muted-foreground px-1">
                <span>{status}</span>
                <span className="font-mono font-bold text-[#CF9FFF] dark:text-[#CF9FFF] [.light_&]:text-[#7F00FF]">
                  {progress}%
                </span>
              </div>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
