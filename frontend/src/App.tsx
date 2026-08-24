import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ScrollToTop from "@/components/ScrollToTop"
import Preloader from "@/components/Preloader"
import Seo from "@/components/Seo"

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
import Developers from "@/pages/Developers"

import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import ClickSpark from "@/components/ClickSpark"
import MembershipPopup from "@/components/MembershipPopup"

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
        <MembershipPopup />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<><Seo path="/" description="Official website of the ISTE Student's Chapter at Madhav Institute of Technology & Science (MITS DU), Gwalior. Explore technical workshops, hackathons, events, student initiatives, and innovation." /><Home /></>} />
              <Route path="/about" element={<><Seo title="About Us" path="/about" description="Learn about the ISTE Student's Chapter at MITS DU Gwalior — our mission, vision, flagship fests like ENIGMA and X-Calibre, and how we foster technical excellence." /><About /></>} />
              <Route path="/mentors" element={<><Seo title="Faculty Mentors" path="/mentors" description="Meet the faculty mentors guiding the ISTE Student's Chapter at MITS DU Gwalior towards innovation and professional excellence." /><Mentors /></>} />
              <Route path="/team" element={<><Seo title="Our Team" path="/team" description="Meet the steering committees and student team powering ISTE MITS Gwalior — executive, technical, management, marketing and more." /><Team /></>} />
              <Route path="/developers" element={<><Seo title="Web Team" path="/developers" description="The student developers who designed and built the official ISTE MITS Gwalior website." /><Developers /></>} />
              <Route path="/events" element={<><Seo title="Events & Workshops" path="/events" description="Explore upcoming and past events by ISTE MITS Gwalior — workshops, hackathons, ENIGMA, X-Calibre and more. Register for free." /><Events /></>} />
              <Route path="/gallery" element={<><Seo title="Gallery" path="/gallery" description="Photo gallery of ISTE MITS Gwalior — moments from our fests, workshops, seminars and student activities." /><Gallery /></>} />
              <Route path="/faqs" element={<><Seo title="FAQs" path="/faqs" description="Frequently asked questions about ISTE MITS Gwalior — membership, event registration, certificates and more." /><Faqs /></>} />
              <Route path="/contact" element={<><Seo title="Contact Us" path="/contact" description="Get in touch with the ISTE Student's Chapter at MITS DU Gwalior — send us a message, find our email, phone and campus address." /><Contact /></>} />
              <Route path="/login" element={<Navigate to="/patidar/admin" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/patidar/admin" element={<><Seo title="Admin Login" path="/patidar/admin" noIndex /><Login /></>} />
              <Route path="/admin/dashboard" element={<><Seo title="Admin Dashboard" path="/admin/dashboard" noIndex /><Admin /></>} />
              <Route path="*" element={<><Seo title="Page Not Found" noIndex /><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm font-semibold">Page Not Found</div></>} />
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
