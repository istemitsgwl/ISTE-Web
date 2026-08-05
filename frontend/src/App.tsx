import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ScrollToTop from "@/components/ScrollToTop"
import Preloader from "@/components/Preloader"

// Lazy load pages for code splitting
const Home = lazy(() => import("@/pages/Home"))
const About = lazy(() => import("@/pages/About"))
const Mentors = lazy(() => import("@/pages/Mentors"))
const Team = lazy(() => import("@/pages/Team"))
const Events = lazy(() => import("@/pages/Events"))
const Gallery = lazy(() => import("@/pages/Gallery"))
const Faqs = lazy(() => import("@/pages/Faqs"))
const Contact = lazy(() => import("@/pages/Contact"))
const Login = lazy(() => import("@/pages/Login"))
const Admin = lazy(() => import("@/pages/Admin"))
const Developers = lazy(() => import("@/pages/Developers"))

import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import ClickSpark from "@/components/ClickSpark"

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(207,159,255,0.3)]" />
    <span className="text-xs text-muted-foreground font-mono animate-pulse tracking-widest uppercase">ISTE Loader...</span>
  </div>
)

function AppContent() {
  const { theme } = useTheme()
  const sparkColor = theme === "dark" ? "#CF9FFF" : "#7C3AED"

  return (
    <ClickSpark
      sparkColor={sparkColor}
      sparkCount={10}
      sparkRadius={25}
      sparkSize={12}
      duration={500}
      easing="ease-out"
    >
      <div className="flex flex-col min-h-screen bg-transparent text-foreground transition-all duration-700 selection:bg-primary selection:text-primary-foreground overflow-x-hidden w-full">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/team" element={<Team />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/faqs" element={<Faqs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Navigate to="/patidar/admin" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/patidar/admin" element={<Login />} />
              <Route path="/admin/dashboard" element={<Admin />} />
              <Route path="*" element={<div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm font-semibold">Page Not Found</div>} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ClickSpark>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Preloader />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
