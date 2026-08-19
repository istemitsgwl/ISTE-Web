import React, { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Linkedin, Instagram, Sparkles } from "lucide-react"
import isteStandaloneLogo from "@/assets/iste-standalone-logo.png"
import isteStandaloneLogoLight from "@/assets/iste-standalone-logo-light.png"
import sdcLogo from "@/assets/sdc-logo.webp"
import { useTheme } from "@/context/ThemeContext"

import { FooterSection } from "./footer/FooterSection"
import { FooterLink } from "./footer/FooterLink"
import { SocialIcon } from "./footer/SocialIcon"
import { ContactCard, ContactInfo } from "./footer/ContactCard"
import { RecentEventItem } from "./footer/RecentEventItem"
import { FooterBrand } from "./footer/FooterBrand"

export default function Footer() {
  const { theme } = useTheme()
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo>({})
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const footerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "/api"

    // Fetch latest 3 events
    fetch(`${apiBase}/events`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRecentEvents(data.slice(0, 3))
        }
      })
      .catch((err) => console.warn("Footer events fetch failed:", err))

    // Fetch contact info
    fetch(`${apiBase}/content/contact`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (data) setContactInfo(data)
      })
      .catch((err) => console.warn("Footer contact fetch failed:", err))
  }, [])

  const tickingRef = useRef(false)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 768 || !footerRef.current) return
    if (tickingRef.current) return

    const clientX = e.clientX
    const clientY = e.clientY
    tickingRef.current = true

    requestAnimationFrame(() => {
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect()
        const x = (clientX - rect.left) / (rect.width || 1) - 0.5
        const y = (clientY - rect.top) / (rect.height || 1) - 0.5
        setMousePos({ x, y })
      }
      tickingRef.current = false
    })
  }

  return (
    <footer
      ref={footerRef}
      onMouseMove={handleMouseMove}
      className="w-full border-t border-border bg-[var(--footer-bg)] dark:border-border/40 dark:bg-[#030614] text-foreground dark:text-white relative overflow-hidden transition-colors duration-300 shadow-[0_-4px_30px_-5px_rgba(221,231,245,0.6)] dark:shadow-none"
    >
      {/* Thin Animated Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/70 via-secondary/70 to-transparent animate-pulse" />

      {/* Mouse Parallax Subtle Floating Glows */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none transition-transform duration-700 ease-out hidden dark:block"
        style={{
          transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 30}px)`
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[600px] h-[350px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none transition-transform duration-700 ease-out hidden dark:block"
        style={{
          transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -30}px)`
        }}
      />

      {/* Subtle Low-Opacity Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40 dark:opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 pt-8 pb-2 sm:pt-10 sm:pb-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8 mb-6 sm:mb-8">
          
          {/* COLUMN 1 — BRAND */}
          <FooterSection delay={0.05}>
            <Link to="/" className="group flex items-center gap-3 select-none">
              <div className="relative shrink-0">
                {/* Soft blur glow behind logo */}
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-md group-hover:bg-primary/50 transition-all duration-300" />
                <img
                  src={theme === "dark" ? isteStandaloneLogo : isteStandaloneLogoLight}
                  alt="ISTE Logo"
                  className="h-11 w-11 sm:h-12 sm:w-12 object-contain relative z-10 transition-transform duration-300 group-hover:rotate-[4deg]"
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

            <p className="text-xs text-muted-foreground leading-relaxed font-medium mt-1">
              Empowering future engineers through state-of-the-art technological workshops, mock placement forums, and flagship national fests.
            </p>

            <div className="flex items-center gap-2.5 mt-2">
              <SocialIcon href="https://linkedin.com" icon={Linkedin} label="LinkedIn" />
              <SocialIcon href="https://www.instagram.com/iste_mits_gwl/" icon={Instagram} label="Instagram" />
            </div>
          </FooterSection>

          {/* COLUMN 2 — EXPLORE */}
          <FooterSection title="Explore" delay={0.1}>
            <nav className="grid grid-cols-2 sm:grid-cols-1 gap-2.5">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/team">Steering Team</FooterLink>
              <FooterLink to="/developers">Developers</FooterLink>
              <FooterLink to="/mentors">Our Mentors</FooterLink>
              <FooterLink to="/events">Flagship Events</FooterLink>
              <FooterLink to="/gallery">Visual Ledger</FooterLink>
              <FooterLink to="/contact">Contact Form</FooterLink>
            </nav>
          </FooterSection>

          {/* COLUMN 3 — RECENT EVENTS */}
          <FooterSection title="Recent Events" delay={0.15}>
            <div className="flex flex-col gap-2">
              {recentEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground font-medium">No recent events.</p>
              ) : (
                recentEvents.map((evt) => (
                  <RecentEventItem key={evt.id} event={evt} />
                ))
              )}
            </div>
          </FooterSection>

          {/* COLUMN 4 — CONTACT */}
          <FooterSection title="Contact & Location" delay={0.2}>
            <ContactCard contactData={contactInfo} />
          </FooterSection>

        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="pt-5 sm:pt-6 border-t border-border/50 dark:border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-semibold">
          <p>© {new Date().getFullYear()} ISTE Student Chapter MITS. All Rights Reserved.</p>
          <Link to="/developers" className="flex items-center gap-2 text-[11px] group hover:brightness-110 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-primary group-hover:animate-pulse" />
            <span className="text-[#CF9FFF] dark:text-[#CF9FFF] [.light_&]:text-[#7C3AED] font-extrabold hover:underline decoration-primary decoration-2 underline-offset-4">
              Designed & Developed by ISTE Web Team
            </span>
          </Link>
          <a
            href="https://sdc.mitsgwalior.in/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-[11px] group hover:brightness-110 transition-all"
          >
            <img
              src={sdcLogo}
              alt="Software Development Club MITS Gwalior"
              className="w-6 h-6 object-contain rounded-full transition-transform duration-300 group-hover:rotate-[8deg]"
            />
            <span className="font-extrabold text-foreground/80 group-hover:text-primary hover:underline decoration-primary decoration-2 underline-offset-4 transition-colors">
              Powered by SDC
            </span>
          </a>
        </div>

        {/* OVERSIZED BRAND TYPOGRAPHY SECTION */}
        <FooterBrand />
      </div>
    </footer>
  )
}
