import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, ClipboardList, Award, Calendar, FileText, Download, 
  Edit3, CheckCircle2, AlertCircle, Sparkles, Bell, ArrowRight, 
  Search, QrCode, LogOut, ExternalLink, ShieldCheck, Clock, Layers
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore"
import { events as staticEvents } from "@/data/siteData"
import { sortEventsDescending } from "@/utils/eventSorter"
import fallbackImage from "@/assets/gallery/iste.jpg"

export default function Dashboard() {
  const { user, logout, setAuth } = useAuthStore()
  const navigate = useNavigate()
  
  const [registrations, setRegistrations] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Student Portal Workspace Tabs
  const [activeTab, setActiveTab] = useState<"registrations" | "certificates" | "recommendations" | "activity">("registrations")
  const [regSearch, setRegSearch] = useState("")
  const [regFilter, setRegFilter] = useState<"all" | "upcoming" | "completed">("all")

  // Edit Profile Drawer / Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    college: "",
    branch: "",
    year: "",
    enrollmentNo: "",
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")

  // Initializing profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        college: user.college || "MITS Gwalior",
        branch: user.branch || "",
        year: user.year || "",
        enrollmentNo: user.enrollmentNo || "",
      })
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // 1. Fetch user event registrations
        const regQuery = query(collection(db, "eventRegistrations"), where("userId", "==", user.uid))
        const regSnap = await getDocs(regQuery)
        const regList: any[] = []
        regSnap.forEach((docSnap) => {
          regList.push({ id: docSnap.id, ...docSnap.data() })
        })
        setRegistrations(regList)

        // 2. Fetch user certificates
        const certQuery = query(collection(db, "certificates"), where("userId", "==", user.uid))
        const certSnap = await getDocs(certQuery)
        const certList: any[] = []
        certSnap.forEach((docSnap) => {
          certList.push({ id: docSnap.id, ...docSnap.data() })
        })
        setCertificates(certList)

        // 3. Fetch recommended upcoming events
        const eventSnap = await getDocs(collection(db, "events"))
        const evList: any[] = []
        eventSnap.forEach((docSnap) => {
          const ev = docSnap.data()
          if (ev) evList.push({ id: docSnap.id, ...ev })
        })
        const sorted = sortEventsDescending(evList.length > 0 ? evList : staticEvents)
        setUpcomingEvents(sorted)
      } catch (err) {
        console.error("Error fetching student portal metrics:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  // Profile Completion Calculations
  const calculateProfileCompletion = () => {
    if (!user) return 0
    let points = 20 // Account creation
    if (user.name) points += 15
    if (user.branch) points += 20
    if (user.year) points += 15
    if (user.enrollmentNo) points += 15
    if (user.phone) points += 15
    return points
  }
  const completionRate = calculateProfileCompletion()

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSavingProfile(true)
    setProfileMessage("")

    try {
      const updatedProfile = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        college: profileForm.college.trim() || "MITS Gwalior",
        branch: profileForm.branch,
        year: profileForm.year,
        enrollmentNo: profileForm.enrollmentNo.trim(),
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true })
      setAuth({ ...user, ...updatedProfile })
      setProfileMessage("✓ Profile details updated successfully!")
      setTimeout(() => {
        setIsEditingProfile(false)
        setProfileMessage("")
      }, 1200)
    } catch (err) {
      console.error("Profile update failed:", err)
      setProfileMessage("❌ Failed to update profile. Please try again.")
    } finally {
      setSavingProfile(false)
    }
  }

  // Filtered Registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const title = (reg.eventTitle || reg.eventId || "").toLowerCase()
    const matchesSearch = title.includes(regSearch.toLowerCase())
    if (!matchesSearch) return false
    if (regFilter === "upcoming") return reg.status === "upcoming"
    if (regFilter === "completed") return reg.status === "completed"
    return true
  })



  // Recent Student Activity Feed
  const recentActivities = [
    { id: "act-1", title: "Portal Authentication Verified", time: "Just now", type: "Security" },
    { id: "act-2", title: `Profile Status ${completionRate}%`, time: "Today", type: "Account" },
    { id: "act-3", title: `Enrolled in ${registrations.length} Chapter Drives`, time: "Active", type: "Events" }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground px-4">
        <div className="text-center max-w-sm glass-panel p-8 rounded-3xl border border-border shadow-2xl">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Student Console Authentication Required</h2>
          <p className="text-xs text-muted-foreground mb-6">Please log in with your credentials to access your dashboard.</p>
          <Button onClick={() => navigate("/login")} variant="glow" className="w-full py-4 font-bold">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative pt-28 sm:pt-32 pb-20 px-4 sm:px-6 transition-colors duration-300">
      {/* Background Accent Glows */}
      <div className="absolute top-[10%] left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-1/4 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* HEADER SECTION */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 mb-8 shadow-card backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Student Profile Info */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-purple-500 p-0.5 shadow-[0_0_20px_rgba(0,243,255,0.25)]">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl sm:text-2xl font-black text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : "S"}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" title="Active Student Session" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    ISTE Chapter Member
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Administrator
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-card-foreground dark:text-white mt-1.5 flex items-center gap-2">
                  Welcome, {user.name}!
                </h1>
                
                <p className="text-xs text-muted-foreground font-semibold mt-1 flex items-center gap-3 flex-wrap">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span>{user.college || "MITS Gwalior"}</span>
                  {user.branch && (
                    <>
                      <span>•</span>
                      <span className="text-primary font-bold">{user.branch} ({user.year || "Student"})</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <Button
                onClick={() => setIsEditingProfile(true)}
                variant="outline"
                className="gap-2 text-xs font-bold py-3 border-border hover:border-primary/40 flex-1 sm:flex-initial"
              >
                <Edit3 className="w-4 h-4 text-primary" />
                Edit Profile
              </Button>

              {user.role === 'admin' && (
                <Button
                  onClick={() => navigate("/admin/dashboard")}
                  variant="glow"
                  className="gap-2 text-xs font-bold py-3 flex-1 sm:flex-initial"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Console
                </Button>
              )}

              <Button
                onClick={() => {
                  logout()
                  navigate("/")
                }}
                variant="outline"
                className="gap-2 text-xs font-bold py-3 border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-6 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 w-full">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground shrink-0">
                Profile Strength
              </span>
              <div className="h-2.5 flex-1 bg-muted/60 dark:bg-slate-900 rounded-full overflow-hidden border border-border/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                />
              </div>
              <span className="text-xs font-black text-primary shrink-0">{completionRate}%</span>
            </div>

            {completionRate < 100 && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-[11px] font-bold text-secondary hover:underline flex items-center gap-1 shrink-0"
              >
                Complete missing fields <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 5 KPI METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-card/40 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Registered</span>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{registrations.length}</p>
              <span className="text-[10px] text-muted-foreground font-medium mt-1 block">Total enrollments</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-card/40 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Upcoming</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">
                {registrations.filter(r => r.status === 'upcoming').length}
              </p>
              <span className="text-[10px] text-muted-foreground font-medium mt-1 block">Active campaigns</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-card/40 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">
                {registrations.filter(r => r.status === 'completed').length}
              </p>
              <span className="text-[10px] text-muted-foreground font-medium mt-1 block">Concluded fests</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-card/40 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Certificates</span>
                <Award className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{certificates.length}</p>
              <span className="text-[10px] text-muted-foreground font-medium mt-1 block">Earned credentials</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-card/40 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Profile</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{completionRate}%</p>
              <span className="text-[10px] text-muted-foreground font-medium mt-1 block">Account status</span>
            </div>
          </motion.div>
        </div>

        {/* WORKSPACE TAB NAVIGATION */}
        <div className="flex items-center gap-2 mb-8 border-b border-border/60 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: "registrations", label: "My Registrations", icon: Calendar, badge: registrations.length },
            { id: "certificates", label: "Certificates & Pass", icon: Award, badge: certificates.length },
            { id: "recommendations", label: "Recommended Events", icon: Sparkles, badge: upcomingEvents.length },
            { id: "activity", label: "Activity Log", icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? "bg-primary text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.25)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-slate-950/20 text-slate-950" : "bg-muted text-muted-foreground border border-border/50"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: MY REGISTRATIONS */}
          {activeTab === "registrations" && (
            <motion.div
              key="registrations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search registered events..."
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    className="bg-card/40 dark:bg-slate-900/40 border-border pl-10 text-xs py-2.5 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {["all", "upcoming", "completed"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setRegFilter(st as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                        regFilter === st
                          ? "bg-muted text-foreground border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                /* Loading Skeleton */
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl border border-border/60 animate-pulse h-32" />
                  ))}
                </div>
              ) : filteredRegistrations.length === 0 ? (
                /* Empty State */
                <div className="glass-panel p-10 rounded-3xl border border-border text-center">
                  <Calendar className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-card-foreground mb-2">No Event Registrations Found</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                    You have not registered for any events matching your filter. Explore available workshops and flagship fests!
                  </p>
                  <Button onClick={() => navigate("/events")} variant="glow" className="gap-2">
                    Browse Flagship Events <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                /* Registrations Grid */
                <div className="grid grid-cols-1 gap-4">
                  {filteredRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="glass-panel p-6 rounded-2xl border border-border/80 bg-card/40 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-primary/40"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shrink-0">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Confirmed Entry
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ID: {reg.registrationId || reg.id}
                            </span>
                          </div>
                          <h4 className="font-bold text-card-foreground text-lg sm:text-xl">
                            {reg.eventTitle || reg.eventId || "Flagship Fest"}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 font-medium">
                            Enrolled on: {reg.createdAt ? new Date(reg.createdAt.seconds ? reg.createdAt.seconds * 1000 : reg.createdAt).toLocaleDateString() : "Active"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {reg.invoiceUrl && (
                          <a
                            href={reg.invoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/60 dark:bg-slate-900 border border-border text-xs font-bold text-foreground hover:text-primary transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            Receipt PDF
                          </a>
                        )}
                        <Button
                          onClick={() => navigate("/events")}
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1 border-border"
                        >
                          View Event <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: CERTIFICATES & DIGITAL PASS */}
          {activeTab === "certificates" && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-8"
            >
              {/* Digital Student Pass Widget */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-secondary/30 bg-gradient-to-br from-secondary/10 via-card/40 to-background relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-secondary/20 rounded-2xl border border-secondary/30 text-secondary shrink-0">
                      <QrCode className="w-10 h-10" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-secondary uppercase tracking-widest block mb-1">
                        Digital Membership Credential
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-foreground">ISTE Student Member Pass</h3>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        Official student ID verification credential for MITS Gwalior drives.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-border/80 text-right self-stretch sm:self-auto flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Member Serial</span>
                    <span className="text-sm font-black text-primary font-mono mt-0.5">
                      ISTE-2025-{user.uid.substr(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificates Section */}
              <div>
                <h3 className="text-base font-bold text-card-foreground mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary" /> Issued Event Credentials ({certificates.length})
                </h3>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="glass-panel p-6 rounded-2xl border border-border/60 animate-pulse h-36" />
                    ))}
                  </div>
                ) : certificates.length === 0 ? (
                  <div className="glass-panel p-8 rounded-2xl border border-border text-center text-muted-foreground text-xs font-semibold">
                    No participation credentials issued yet. Attend chapter events to earn official participation certificates.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="glass-panel p-6 rounded-2xl border border-border/80 bg-card/40 dark:bg-slate-900/40 flex flex-col justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-secondary bg-secondary/10 px-2.5 py-1 rounded-full border border-secondary/20 inline-block mb-2">
                            Verified Certificate
                          </span>
                          <h4 className="font-bold text-card-foreground text-lg">{cert.eventTitle || "Technical Fest"}</h4>
                          <p className="text-xs text-muted-foreground mt-1 font-medium">
                            Issued: {cert.createdAt ? new Date(cert.createdAt.seconds ? cert.createdAt.seconds * 1000 : cert.createdAt).toLocaleDateString() : "Recent"}
                          </p>
                        </div>
                        <a
                          href={cert.fileUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-xs font-bold text-secondary transition-all w-full"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF Certificate
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: RECOMMENDED UPCOMING EVENTS */}
          {activeTab === "recommendations" && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-card-foreground">Flagship Events Recommended For You</h3>
                <Button onClick={() => navigate("/events")} variant="outline" size="sm" className="text-xs gap-1">
                  View Catalog <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingEvents.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="glass-panel rounded-2xl overflow-hidden border border-border/80 bg-card/40 dark:bg-slate-900/40 flex flex-col justify-between">
                    <div className="h-40 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${ev.bannerImage || ev.image || fallbackImage})` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                      <span className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        ev.status === 'upcoming' ? 'bg-primary text-slate-950' : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {ev.status}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-[10px] text-primary font-extrabold uppercase tracking-widest mb-1 block">{ev.date}</span>
                      <h4 className="font-extrabold text-foreground text-base mb-2">{ev.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-6 leading-relaxed font-medium flex-1">{ev.desc}</p>
                      
                      <Button
                        onClick={() => navigate("/events")}
                        variant="glow"
                        size="sm"
                        className="w-full justify-center font-bold text-xs py-2.5"
                      >
                        Register Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}


          {/* TAB 5: ACTIVITY LOG */}
          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-6 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40"
            >
              <h3 className="text-base font-bold text-card-foreground mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" /> Recent Account Activity
              </h3>

              <div className="flex flex-col gap-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-4 relative pl-8">
                    <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{act.title}</h4>
                      <span className="text-[10px] text-muted-foreground">{act.time} • {act.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg rounded-3xl border border-border p-6 sm:p-8 bg-card dark:bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Edit Profile Details
                </h3>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name *</label>
                  <Input
                    required
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Branch *</label>
                    <select
                      value={profileForm.branch}
                      onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                      className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select Branch</option>
                      <option value="Computer Science & Eng.">Computer Science & Eng.</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Comm.">Electronics & Comm.</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Chemical / Other">Chemical / Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Academic Year *</label>
                    <select
                      value={profileForm.year}
                      onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                      className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Enrollment Number</label>
                    <Input
                      type="text"
                      value={profileForm.enrollmentNo}
                      onChange={(e) => setProfileForm({ ...profileForm, enrollmentNo: e.target.value })}
                      placeholder="e.g. 0901CS211042"
                      className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label>
                    <Input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">College / Institution</label>
                  <Input
                    type="text"
                    value={profileForm.college}
                    onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                    placeholder="MITS Gwalior"
                    className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                {profileMessage && (
                  <p className={`text-xs font-bold p-3 rounded-xl ${
                    profileMessage.includes("✓") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}>
                    {profileMessage}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    variant="glow"
                    className="w-full py-4 font-bold text-xs sm:text-sm justify-center"
                  >
                    {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
