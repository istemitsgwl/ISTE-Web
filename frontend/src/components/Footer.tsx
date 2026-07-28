import { Link } from "react-router-dom"
import { Mail, Phone, MapPin, Linkedin, Instagram, Github } from "lucide-react"
import isteStandaloneLogo from "@/assets/iste-standalone-logo.png"
import isteStandaloneLogoLight from "@/assets/iste-standalone-logo-light.png"
import { useTheme } from "@/context/ThemeContext"

export default function Footer() {
  const { theme } = useTheme()

  return (
    <footer className="w-full border-t border-border bg-[var(--footer-bg)] dark:border-border/40 dark:bg-[#040816] text-foreground dark:text-white relative overflow-hidden transition-colors duration-300 shadow-[0_-4px_25px_-5px_rgba(221,231,245,0.5)] dark:shadow-none">
      {/* Dark mode bottom accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none hidden dark:block" />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link 
              to="/" 
              className="group flex items-center gap-3 select-none"
            >
              <div className="relative shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:rotate-[4deg]">
                <img 
                  src={theme === "dark" ? isteStandaloneLogo : isteStandaloneLogoLight} 
                  alt="ISTE Logo" 
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-[0_0_10px_rgba(207,159,255,0.4)]" 
                />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <span className="font-extrabold text-base sm:text-lg tracking-wide text-[#CF9FFF] dark:text-[#CF9FFF] [.light_&]:text-[#7F00FF]">
                  ISTE MITS
                </span>
                <span className="text-[10.5px] font-medium text-foreground/80 tracking-normal mt-0.5">
                  Indian Society for Technical Education
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground tracking-[0.14em] uppercase mt-0.5">
                  Student Chapter • MITS Gwalior
                </span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Empowering future engineers through state-of-the-art technological workshops, mock prep forums, and flagship national fests.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-card dark:bg-slate-900 border border-border/60 dark:border-border text-primary dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-all shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-card dark:bg-slate-900 border border-border/60 dark:border-border text-secondary dark:text-muted-foreground hover:text-secondary dark:hover:text-secondary transition-all shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-card dark:bg-slate-900 border border-border/60 dark:border-border text-primary dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-all shadow-sm"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-card-foreground dark:text-white">Quick Links</h4>
            <nav className="flex flex-col gap-2.5 text-xs text-muted-foreground font-semibold">
              <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link to="/mentors" className="hover:text-primary transition-colors">Our Mentors</Link>
              <Link to="/team" className="hover:text-primary transition-colors">Steering Team</Link>
              <Link to="/events" className="hover:text-primary transition-colors">Flagship Events</Link>
            </nav>
          </div>

          {/* Chapters Info */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-card-foreground dark:text-white">Resources</h4>
            <nav className="flex flex-col gap-2.5 text-xs text-muted-foreground font-semibold">
              <Link to="/gallery" className="hover:text-primary transition-colors">Visual Ledger</Link>
              <Link to="/faqs" className="hover:text-primary transition-colors">Faqs & Help</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact Form</Link>
              <a href="https://linktr.ee/iste_mits_gwl" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                Official Linktree
              </a>
            </nav>
          </div>

          {/* Contact Col */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-card-foreground dark:text-white">Contact Info</h4>
            <div className="flex flex-col gap-3 text-xs text-muted-foreground font-semibold">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary shrink-0" />
                <span>iste.mits.gwl@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary shrink-0" />
                <span>Faizan: 7697827864</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary shrink-0" />
                <span>MITS Campus, Gwalior (MP)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border dark:border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} ISTE MITS Student Chapter. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
