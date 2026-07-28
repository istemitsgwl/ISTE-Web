import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "./ui/Button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "./ui/DropdownMenu"
import { Menu, User, LogOut, LayoutDashboard, Shield, Sun, Moon } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "./ui/Sheet"
import { motion } from "framer-motion"
import isteStandaloneLogo from "@/assets/iste-standalone-logo.png"
import isteStandaloneLogoLight from "@/assets/iste-standalone-logo-light.png"

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Mentors", path: "/mentors" },
    { name: "Team", path: "/team" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
    { name: "FAQs", path: "/faqs" },
    { name: "Contact", path: "/contact" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8 md:px-12 lg:px-16 w-full flex items-center justify-between pointer-events-none">
      
      {/* LEFT: Unboxed Premium Organization Branding (Scaled down 20-25%) */}
      <div className="flex items-center shrink-0 pointer-events-auto">
        <Link 
          to="/" 
          className="group flex items-center gap-2.5 sm:gap-3 select-none transition-all duration-300"
        >
          {/* Logo (42px - 48px) */}
          <div className="relative shrink-0 transition-transform duration-300 group-hover:rotate-[3deg]">
            <img 
              src={theme === "dark" ? isteStandaloneLogo : isteStandaloneLogoLight} 
              alt="ISTE Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain" 
            />
          </div>

          {/* Organization Name Block */}
          <div className="flex flex-col justify-center leading-tight">
            {/* ISTE - Anton Font (24px - 28px) */}
            <span 
              style={{ fontFamily: "'Anton', sans-serif" }}
              className="text-[23px] sm:text-[26px] md:text-[28px] leading-none tracking-[0.04em] text-[#CF9FFF] dark:text-[#CF9FFF] [.light_&]:text-[#7F00FF] transition-all duration-300 group-hover:brightness-110"
            >
              ISTE
            </span>

            {/* Indian Society For Technical Education */}
            <span className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-medium text-[#F4F0FF] dark:text-[#F4F0FF] [.light_&]:text-[#111827] leading-[1.15] mt-0.5 whitespace-nowrap transition-colors duration-300">
              Indian Society<br />For Technical Education
            </span>
          </div>

          {/* Vertical Divider Line */}
          <div className="hidden lg:block h-[40px] w-[1px] bg-[rgba(207,159,255,0.25)] dark:bg-[rgba(207,159,255,0.25)] [.light_&]:bg-[rgba(127,0,255,0.25)] mx-0.5 transition-all duration-300 group-hover:bg-[#CF9FFF]/60 group-hover:shadow-[0_0_8px_rgba(207,159,255,0.6)]" />

          {/* Chapter Information */}
          <div className="hidden lg:flex flex-col justify-center leading-tight">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/65 dark:text-white/65 [.light_&]:text-foreground/65 transition-colors duration-300">
              Students' Chapter
            </span>
            <span className="text-[11.5px] font-semibold text-[#F4F0FF] dark:text-[#F4F0FF] [.light_&]:text-[#111827] mt-0.5 transition-colors duration-300">
              MITS Gwalior
            </span>
          </div>
        </Link>
      </div>

      {/* CENTER: Dedicated Glass Pill Capsule for Navigation Links ONLY */}
      <nav className="hidden md:flex items-center justify-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full border border-white/10 dark:border-white/10 [.light_&]:border-black/10 bg-[rgba(16,27,46,0.55)] dark:bg-[rgba(16,27,46,0.55)] [.light_&]:bg-[rgba(255,255,255,0.65)] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all pointer-events-auto">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors duration-300 rounded-full ${
                isActive
                  ? "text-primary font-black"
                  : "text-muted-foreground hover:text-secondary"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
                </motion.div>
              )}
              <span className="relative z-10">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* RIGHT: Tools & Auth (Theme Toggle & Profile outside the nav capsule) */}
      <div className="flex items-center justify-end gap-3 pointer-events-auto">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-white/10 dark:border-white/10 [.light_&]:border-black/10 bg-[rgba(16,27,46,0.55)] dark:bg-[rgba(16,27,46,0.55)] [.light_&]:bg-[rgba(255,255,255,0.65)] backdrop-blur-[20px] text-muted-foreground hover:text-foreground transition-all duration-300 relative group overflow-hidden shadow-sm"
          aria-label="Toggle Theme"
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === "dark" ? 0 : 90, scale: theme === "dark" ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="h-4.5 w-4.5"
          >
            <Moon className="h-4.5 w-4.5" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{ rotate: theme === "light" ? 0 : -90, scale: theme === "light" ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-2 h-4.5 w-4.5"
          >
            <Sun className="h-4.5 w-4.5" />
          </motion.div>
        </button>

        {/* Auth Button / Dropdown */}
        <div className="hidden md:block">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-primary/30 rounded-full font-bold bg-[rgba(16,27,46,0.55)] dark:bg-[rgba(16,27,46,0.55)] [.light_&]:bg-[rgba(255,255,255,0.65)] backdrop-blur-[20px]">
                  <User className="h-4 w-4 text-primary" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-border bg-popover/90 backdrop-blur-md">
                <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer font-semibold rounded-xl">
                  <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="cursor-pointer font-semibold rounded-xl">
                    <Shield className="mr-2 h-4 w-4 text-secondary" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10 cursor-pointer font-semibold rounded-xl">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/login")} variant="glow" size="sm" className="rounded-full font-bold">
              Login
            </Button>
          )}
        </div>

        {/* Mobile Sheet Trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-full bg-[rgba(16,27,46,0.55)] dark:bg-[rgba(16,27,46,0.55)] [.light_&]:bg-[rgba(255,255,255,0.65)] backdrop-blur-[20px] border border-white/10">
              <Menu className="h-5 w-5 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-6 pt-12 bg-background border-l border-border/40">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={`text-base font-bold uppercase tracking-wider transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto flex flex-col gap-4">
              {isAuthenticated && user ? (
                <>
                  <Button onClick={() => { setOpen(false); navigate("/dashboard/profile"); }} variant="outline" className="w-full justify-start gap-2 rounded-xl font-bold">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span>Dashboard</span>
                  </Button>
                  {user.role === "admin" && (
                    <Button onClick={() => { setOpen(false); navigate("/admin/dashboard"); }} variant="outline" className="w-full justify-start gap-2 border-secondary/30 rounded-xl font-bold">
                      <Shield className="h-4 w-4 text-secondary" />
                      <span>Admin Panel</span>
                    </Button>
                  )}
                  <Button onClick={() => { setOpen(false); handleLogout(); }} variant="destructive" className="w-full justify-start gap-2 rounded-xl font-bold">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <Button onClick={() => { setOpen(false); navigate("/login"); }} variant="glow" className="w-full rounded-xl font-bold">
                  Login / Join
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
