import React, { useEffect, useState, useRef } from "react"
import { useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, ArrowRight, ShieldCheck, Award, Users, CheckCircle2 } from "lucide-react"
import posterWebp from "@/assets/membership-poster.webp"
import posterJpg from "@/assets/membership-poster.jpg"

// Configurable Membership Registration URL
export const MEMBERSHIP_REGISTRATION_URL =
  import.meta.env.VITE_MEMBERSHIP_REGISTRATION_URL || "https://linktr.ee/iste_mits_gwl"

// Helper function to reopen the existing Membership Popup from anywhere (e.g. Hero section trigger)
export const openMembershipPopup = () => {
  window.dispatchEvent(new CustomEvent("open-membership-popup"))
}

const POPUP_STORAGE_KEY = "iste_membership_popup_dismissed_v1"

export default function MembershipPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Listen for custom reopen event from Hero trigger or other buttons
  useEffect(() => {
    const handleCustomOpen = () => {
      setIsOpen(true)
    }

    window.addEventListener("open-membership-popup", handleCustomOpen)
    return () => {
      window.removeEventListener("open-membership-popup", handleCustomOpen)
    }
  }, [])

  useEffect(() => {
    // Do not display on admin or login routes
    const isExcludedRoute =
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/patidar/admin") ||
      location.pathname.startsWith("/login")

    if (isExcludedRoute) {
      setIsOpen(false)
      return
    }

    // Check session storage
    const isDismissed = sessionStorage.getItem(POPUP_STORAGE_KEY)
    if (!isDismissed) {
      // Delay popup display slightly for smooth page entry
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  const handleClose = () => {
    sessionStorage.setItem(POPUP_STORAGE_KEY, "true")
    setIsOpen(false)
  }

  // Handle Keyboard Navigation (ESC to close) & Focus Trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    const timer = setTimeout(() => closeBtnRef.current?.focus(), 100)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      clearTimeout(timer)
    }
  }, [isOpen])

  const handleJoinNow = () => {
    window.open(MEMBERSHIP_REGISTRATION_URL, "_blank", "noopener,noreferrer")
    handleClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="membership-popup-title"
          aria-describedby="membership-popup-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
        >
          {/* Backdrop Blur & Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row bg-[#080b1a] dark:bg-[#080b1a] [.light_&]:bg-white border border-primary/30 dark:border-primary/40 rounded-3xl shadow-[0_0_50px_rgba(207,159,255,0.25)] dark:shadow-[0_0_50px_rgba(207,159,255,0.2)] overflow-hidden z-10 my-auto"
          >
            {/* Ambient Background Glow Effects */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/15 rounded-full blur-[90px] pointer-events-none" />

            {/* Close (X) Button */}
            <button
              ref={closeBtnRef}
              onClick={handleClose}
              aria-label="Close membership announcement"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2.5 rounded-full bg-slate-900/80 dark:bg-slate-900/80 [.light_&]:bg-slate-100 text-slate-400 hover:text-white [.light_&]:hover:text-slate-900 border border-slate-700/60 hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 group outline-none focus:ring-2 focus:ring-primary"
            >
              <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
            </button>

            {/* LEFT COLUMN / TOP ON MOBILE: Membership Poster Image */}
            <div className="w-full md:w-1/2 bg-slate-950 flex items-center justify-center p-3 sm:p-4 relative group overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-slate-800/80">
              <picture className="w-full flex justify-center items-center">
                <source srcSet={posterWebp} type="image/webp" />
                <img
                  src={posterJpg}
                  alt="ISTE MITS DU Membership Benefits & Announcement Poster"
                  loading="eager"
                  className="max-h-[280px] sm:max-h-[360px] md:max-h-[500px] w-auto max-w-full object-contain rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </picture>
            </div>

            {/* RIGHT COLUMN / BOTTOM ON MOBILE: Information & CTA */}
            <div className="w-full md:w-1/2 p-5 sm:p-7 md:p-8 flex flex-col justify-between overflow-y-auto relative z-10">
              <div className="flex flex-col gap-3.5">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold tracking-wider uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE NOW
                  </span>
                  <span className="text-[11px] font-bold text-primary tracking-widest uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    ISTE MITS DU 2026
                  </span>
                </div>

                {/* Title */}
                <h2
                  id="membership-popup-title"
                  className="text-2xl sm:text-3xl font-black tracking-tight text-white [.light_&]:text-slate-900 leading-tight"
                >
                  ISTE MEMBERSHIP IS <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-300">LIVE</span>
                </h2>

                {/* Message */}
                <p
                  id="membership-popup-desc"
                  className="text-xs sm:text-sm text-slate-300 [.light_&]:text-slate-600 leading-relaxed font-medium"
                >
                  Join the <strong className="text-white [.light_&]:text-slate-900">ISTE MITS DU</strong> community and unlock exclusive benefits, events, certifications, networking, and skill-development opportunities.
                </p>

                {/* Key Highlights / Benefits List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 [.light_&]:bg-slate-100 border border-slate-800/80 [.light_&]:border-slate-200">
                    <Award className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 [.light_&]:text-slate-800">Verified Certificates</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 [.light_&]:bg-slate-100 border border-slate-800/80 [.light_&]:border-slate-200">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 [.light_&]:text-slate-800">Event Discounts</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 [.light_&]:bg-slate-100 border border-slate-800/80 [.light_&]:border-slate-200">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 [.light_&]:text-slate-800">Senior Mentorship</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 [.light_&]:bg-slate-100 border border-slate-800/80 [.light_&]:border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 [.light_&]:text-slate-800">Leadership Roles</span>
                  </div>
                </div>
              </div>

              {/* CTA Button Action Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-5 pt-4 border-t border-slate-800/80 [.light_&]:border-slate-200">
                <button
                  onClick={handleJoinNow}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98]"
                >
                  <span>Join / Register Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-900/80 [.light_&]:bg-slate-200 hover:bg-slate-800 text-slate-400 [.light_&]:text-slate-700 font-bold text-xs transition-colors border border-slate-800 [.light_&]:border-slate-300"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
