import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ScrollToTop from "@/components/ScrollToTop"
import Preloader from "@/components/Preloader"

// Pages
import Home from "@/pages/Home"
import About from "@/pages/About"
import Mentors from "@/pages/Mentors"
import Team from "@/pages/Team"
import Events from "@/pages/Events"
import Gallery from "@/pages/Gallery"
import Faqs from "@/pages/Faqs"
import Contact from "@/pages/Contact"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import Admin from "@/pages/Admin"

import { ThemeProvider } from "@/context/ThemeContext"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Preloader />
        <div className="flex flex-col min-h-screen bg-transparent text-foreground transition-all duration-700 selection:bg-primary selection:text-primary-foreground overflow-x-hidden w-full">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/team" element={<Team />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/faqs" element={<Faqs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/profile" element={<Dashboard />} />
              <Route path="/admin/dashboard" element={<Admin />} />
              <Route path="*" element={<div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm font-semibold">Page Not Found</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
