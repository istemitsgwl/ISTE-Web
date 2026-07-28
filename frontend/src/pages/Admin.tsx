import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, Users, Calendar, Wallet, FileText, 
  Settings, Plus, Trash2, HelpCircle, Download, Image as ImageIcon,
  Search, RefreshCw, Zap, ExternalLink, CheckCircle2, AlertCircle,
  Activity, Database, Filter, Edit, Layers, ArrowUpRight, ArrowRight, Clock
} from "lucide-react"
import { db, storage } from "@/lib/firebase"
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from "firebase/firestore"
import { ref, deleteObject } from "firebase/storage"
import { mentors as staticMentors } from "@/data/siteData"
import fallbackImage from "@/assets/gallery/iste.jpg"
import { sortEventsDescending } from "@/utils/eventSorter"

export default function Admin() {
  const { user, loading: authLoading } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "gallery" | "team" | "faqs" | "registrations">("overview")

  // State for database records
  const [localEvents, setLocalEvents] = useState<any[]>([])
  const [localFaqs, setLocalFaqs] = useState<any[]>([])
  const [dbRegistrations, setDbRegistrations] = useState<any[]>([])
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [teamItems, setTeamItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  // Search & Filter States
  const [eventSearch, setEventSearch] = useState("")
  const [eventStatusFilter, setEventStatusFilter] = useState("all")
  const [gallerySearch, setGallerySearch] = useState("")
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState("all")
  const [teamSearch, setTeamSearch] = useState("")
  const [teamCommitteeFilter, setTeamCommitteeFilter] = useState("all")
  const [faqSearch, setFaqSearch] = useState("")
  const [regSearch, setRegSearch] = useState("")
  const [selectedEventFilter, setSelectedEventFilter] = useState("all")

  // Audit Log State
  const [activityLogs, setActivityLogs] = useState<Array<{ id: string; action: string; category: string; timestamp: string }>>([
    { id: "log-1", action: "Cloud Firestore Session Synchronized", category: "System", timestamp: "Just now" },
    { id: "log-2", action: "Admin Privileges Authenticated", category: "Auth", timestamp: "1 min ago" }
  ])

  const logAction = (action: string, category: string) => {
    setActivityLogs(prev => [
      { id: `log-${Date.now()}`, action, category, timestamp: "Just now" },
      ...prev.slice(0, 9)
    ])
  }

  // Form States for Events
  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "Technical Fest",
    date: "",
    venue: "",
    desc: "",
    status: "upcoming",
    bannerImage: "",
  })
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [eventBannerMode, setEventBannerMode] = useState<"file" | "url">("url")
  const [eventBannerFile, setEventBannerFile] = useState<File | null>(null)
  const [eventBannerUploading, setEventBannerUploading] = useState(false)

  // Form States for FAQs
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" })
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)

  // Form States for Gallery
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [newGalleryTitle, setNewGalleryTitle] = useState("")
  const [newGalleryCategory, setNewGalleryCategory] = useState("Events")
  const [galleryFile, setGalleryFile] = useState<File | null>(null)
  const [galleryUrlInput, setGalleryUrlInput] = useState("")
  const [galleryInputMode, setGalleryInputMode] = useState<"file" | "url">("file")
  const [galleryError, setGalleryError] = useState("")
  const [gallerySuccess, setGallerySuccess] = useState("")
  const [editingGalleryItem, setEditingGalleryItem] = useState<any | null>(null)

  // Form States for Team Members
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("")
  const [newMemberCommittee, setNewMemberCommittee] = useState("Technical Committee")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberLinkedin, setNewMemberLinkedin] = useState("")
  const [memberFile, setMemberFile] = useState<File | null>(null)
  const [memberUrlInput, setMemberUrlInput] = useState("")
  const [memberInputMode, setMemberInputMode] = useState<"file" | "url">("file")
  const [memberUploading, setMemberUploading] = useState(false)
  const [memberError, setMemberError] = useState("")
  const [memberSuccess, setMemberSuccess] = useState("")
  const [editingMember, setEditingMember] = useState<any | null>(null)

  // Fetch data on load
  const refreshAdminData = async () => {
    setLoading(true)
    try {
      // 1. Fetch events from Firestore
      const eventSnap = await getDocs(collection(db, "events"))
      const evList: any[] = []
      eventSnap.forEach((docSnap) => {
        evList.push({ id: docSnap.id, ...docSnap.data() })
      })
      setLocalEvents(sortEventsDescending(evList))

      // 2. Fetch FAQs from Firestore
      const faqSnap = await getDocs(collection(db, "faqs"))
      const fList: any[] = []
      faqSnap.forEach((docSnap) => {
        fList.push({ id: docSnap.id, ...docSnap.data() })
      })
      setLocalFaqs(fList)

      // 3. Fetch registrations from Firestore
      const regSnap = await getDocs(collection(db, "eventRegistrations"))
      const rList: any[] = []
      regSnap.forEach((docSnap) => {
        rList.push({ id: docSnap.id, ...docSnap.data() })
      })
      setDbRegistrations(rList)

      // 4. Fetch gallery items from Firestore
      const gallerySnap = await getDocs(collection(db, "gallery"))
      const gList: any[] = []
      gallerySnap.forEach((docSnap) => {
        const item = docSnap.data()
        if (item && item.image) {
          gList.push({ id: docSnap.id, ...item })
        }
      })
      setGalleryItems(gList)

      // 5. Fetch team items from Firestore
      const teamSnap = await getDocs(collection(db, "team"))
      const tList: any[] = []
      teamSnap.forEach((docSnap) => {
        const item = docSnap.data()
        if (item) {
          tList.push({ id: docSnap.id, ...item })
        }
      })

      const uniqueTeamMap = new Map<string, any>()

      if (tList.length > 0) {
        tList.forEach((m) => {
          const normKey = (m.name || m.id).toLowerCase().trim()
          if (normKey && !uniqueTeamMap.has(normKey)) {
            uniqueTeamMap.set(normKey, m)
          }
        })
        setTeamItems(Array.from(uniqueTeamMap.values()))
      } else {
        setTeamItems([])
      }
    } catch (err) {
      console.error("Error loading admin records from Firestore:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAdminData()
  }, [user])

  // Convert and compress file to base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const maxDim = 1200
          let width = img.width
          let height = img.height

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL("image/jpeg", 0.85))
          } else {
            resolve(e.target?.result as string)
          }
        }
        img.onerror = () => resolve(e.target?.result as string)
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Handle Event Creation & Updates
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.title.trim()) {
      alert("Please enter an event title.")
      return
    }

    setEventBannerUploading(true)
    let finalBannerUrl = newEvent.bannerImage.trim()

    try {
      if (eventBannerMode === "file" && eventBannerFile) {
        finalBannerUrl = await fileToBase64(eventBannerFile)
      }

      if (!finalBannerUrl) {
        alert("Please provide an image file or a valid banner URL.")
        setEventBannerUploading(false)
        return
      }

      const eventId = editingEventId || `event-${Date.now()}`
      const eventData = {
        id: eventId,
        title: newEvent.title.trim(),
        category: newEvent.category,
        date: newEvent.date.trim() || "Coming Soon",
        venue: newEvent.venue.trim() || "MITS Campus",
        desc: newEvent.desc.trim(),
        status: newEvent.status,
        bannerImage: finalBannerUrl,
        image: finalBannerUrl,
        updatedAt: new Date().toISOString(),
        createdAt: editingEventId ? undefined : new Date().toISOString(),
      }

      await setDoc(doc(db, "events", eventId), eventData, { merge: true })
      
      if (editingEventId) {
        const updated = localEvents.map(ev => ev.id === editingEventId ? { ...ev, ...eventData } : ev)
        setLocalEvents(sortEventsDescending(updated))
        logAction(`Updated event: ${newEvent.title}`, "Events")
        alert("Event updated successfully!")
      } else {
        const updated = [eventData, ...localEvents]
        setLocalEvents(sortEventsDescending(updated))
        logAction(`Created new event: ${newEvent.title}`, "Events")
        alert("Event created successfully!")
      }

      setNewEvent({ title: "", category: "Technical Fest", date: "", venue: "", desc: "", status: "upcoming", bannerImage: "" })
      setEditingEventId(null)
      setEventBannerFile(null)
    } catch (err) {
      console.error("Failed to save event to Firestore:", err)
      alert("Failed to save event to Firestore.")
    } finally {
      setEventBannerUploading(false)
    }
  }

  const startEditEvent = (evt: any) => {
    setEditingEventId(evt.id)
    setNewEvent({
      title: evt.title || "",
      category: evt.category || "Technical Fest",
      date: evt.date || "",
      venue: evt.venue || "",
      desc: evt.desc || "",
      status: evt.status || "upcoming",
      bannerImage: evt.bannerImage || evt.image || "",
    })
    setEventBannerMode("url")
    window.scrollTo({ top: 400, behavior: "smooth" })
  }

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      await deleteDoc(doc(db, "events", id))
      setLocalEvents(localEvents.filter(ev => ev.id !== id))
      logAction(`Deleted event: ${title}`, "Events")
    } catch (err) {
      console.error(err)
      alert("Failed to delete event.")
    }
  }

  // Handle Gallery Upload
  // Handle Gallery Upload & Edit
  const startEditGallery = (item: any) => {
    setEditingGalleryItem(item)
    setNewGalleryTitle(item.title || "")
    setNewGalleryCategory(item.category || "Events")
    setGalleryUrlInput(item.image || "")
    setGalleryInputMode("url")
    window.scrollTo({ top: 500, behavior: "smooth" })
  }

  const handleGalleryUpload = async () => {
    if (!newGalleryTitle.trim()) {
      setGalleryError("Please enter an image title.")
      return
    }
    if (!editingGalleryItem && galleryInputMode === "file" && !galleryFile) {
      setGalleryError("Please select an image file.")
      return
    }
    if (!editingGalleryItem && galleryInputMode === "url" && !galleryUrlInput.trim()) {
      setGalleryError("Please enter an image URL.")
      return
    }

    setGalleryError("")
    setGallerySuccess("")
    setGalleryUploading(true)

    try {
      let imageData = editingGalleryItem ? editingGalleryItem.image : ""
      let storagePath = editingGalleryItem ? (editingGalleryItem.storagePath || "") : ""

      if (galleryInputMode === "url" && galleryUrlInput.trim()) {
        imageData = galleryUrlInput.trim()
        storagePath = ""
      } else if (galleryFile) {
        imageData = await fileToBase64(galleryFile)
        storagePath = ""
      }

      const galleryDocId = editingGalleryItem ? editingGalleryItem.id : `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      const newItem = {
        id: galleryDocId,
        title: newGalleryTitle.trim(),
        category: newGalleryCategory,
        image: imageData,
        storagePath,
        createdAt: editingGalleryItem ? (editingGalleryItem.createdAt || new Date().toISOString()) : new Date().toISOString()
      }

      await setDoc(doc(db, "gallery", galleryDocId), newItem)

      if (editingGalleryItem) {
        setGalleryItems(galleryItems.map(g => g.id === editingGalleryItem.id ? newItem : g))
        setGallerySuccess("✓ Gallery asset updated successfully!")
        logAction(`Updated gallery image: ${newGalleryTitle}`, "Gallery")
      } else {
        setGalleryItems([newItem, ...galleryItems])
        setGallerySuccess("✓ Image successfully uploaded to Gallery!")
        logAction(`Uploaded gallery image: ${newGalleryTitle}`, "Gallery")
      }

      setNewGalleryTitle("")
      setGalleryFile(null)
      setGalleryUrlInput("")
      setEditingGalleryItem(null)

      setTimeout(() => setGallerySuccess(""), 4000)
    } catch (err: any) {
      console.error("Gallery save failed:", err)
      setGalleryError("Save failed: " + (err?.message || "Unknown error"))
    } finally {
      setGalleryUploading(false)
    }
  }

  const handleGalleryDelete = async (item: any) => {
    if (!confirm(`Delete "${item.title}" from gallery?`)) return
    try {
      if (item.id.startsWith("gallery-static-")) {
        setGalleryItems(galleryItems.filter(g => g.id !== item.id))
      } else {
        await deleteDoc(doc(db, "gallery", item.id))
        if (item.storagePath) {
          deleteObject(ref(storage, item.storagePath)).catch(() => {})
        }
        setGalleryItems(galleryItems.filter(g => g.id !== item.id))
      }
      logAction(`Deleted gallery item: ${item.title}`, "Gallery")
    } catch (err) {
      console.error("Gallery delete error:", err)
      alert("Failed to delete gallery item.")
    }
  }

  // Handle Team Member Upload
  const handleMemberSave = async () => {
    if (!newMemberName.trim()) {
      setMemberError("Please enter member name.")
      return
    }
    if (!newMemberRole.trim()) {
      setMemberError("Please enter member role/designation.")
      return
    }
    if (!editingMember && memberInputMode === "file" && !memberFile) {
      setMemberError("Please select a profile photo.")
      return
    }
    if (!editingMember && memberInputMode === "url" && !memberUrlInput.trim()) {
      setMemberError("Please enter a profile image URL.")
      return
    }

    setMemberError("")
    setMemberSuccess("")
    setMemberUploading(true)

    try {
      let imageData = editingMember ? editingMember.img : ""
      let storagePath = editingMember ? (editingMember.storagePath || "") : ""

      if (memberInputMode === "url" && memberUrlInput.trim()) {
        imageData = memberUrlInput.trim()
        storagePath = ""
      } else if (memberFile) {
        imageData = await fileToBase64(memberFile)
        storagePath = ""
      }

      const docId = editingMember ? editingMember.id : `team-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      const savedMember = {
        id: docId,
        name: newMemberName.trim(),
        role: newMemberRole.trim(),
        committee: newMemberCommittee,
        img: imageData,
        linkedin: newMemberLinkedin.trim(),
        email: newMemberEmail.trim(),
        storagePath,
        createdAt: editingMember ? (editingMember.createdAt || new Date().toISOString()) : new Date().toISOString()
      }

      await setDoc(doc(db, "team", docId), savedMember)

      if (editingMember) {
        setTeamItems(teamItems.map(m => m.id === editingMember.id ? savedMember : m))
        setMemberSuccess("✓ Member updated successfully!")
        logAction(`Updated team member: ${newMemberName}`, "Team")
      } else {
        setTeamItems([savedMember, ...teamItems])
        setMemberSuccess("✓ Member added to team successfully!")
        logAction(`Added team member: ${newMemberName}`, "Team")
      }

      setNewMemberName("")
      setNewMemberRole("")
      setNewMemberEmail("")
      setNewMemberLinkedin("")
      setMemberFile(null)
      setMemberUrlInput("")
      setEditingMember(null)

      setTimeout(() => setMemberSuccess(""), 4000)
    } catch (err: any) {
      console.error("Team member save error:", err)
      setMemberError("Failed to save team member: " + (err?.message || "Unknown error"))
    } finally {
      setMemberUploading(false)
    }
  }

  const startEditMember = (member: any) => {
    setEditingMember(member)
    setNewMemberName(member.name || "")
    setNewMemberRole(member.role || "")
    setNewMemberCommittee(member.committee || "Technical Committee")
    setNewMemberEmail(member.email || "")
    setNewMemberLinkedin(member.linkedin || "")
    setMemberUrlInput(member.img || "")
    setMemberInputMode("url")
    window.scrollTo({ top: 500, behavior: "smooth" })
  }

  const handleMemberDelete = async (member: any) => {
    if (!confirm(`Delete ${member.name} from Team?`)) return
    try {
      // 1. If it has a specific Firestore ID (not purely static placeholder), delete by ID
      if (member.id && !member.id.startsWith("team-static-")) {
        await deleteDoc(doc(db, "team", member.id))
      }

      // 2. Query Firestore by member name to purge any seeded or duplicate documents for this person
      if (member.name) {
        const q = query(collection(db, "team"), where("name", "==", member.name))
        const qSnap = await getDocs(q)
        const deletePromises: Promise<void>[] = []
        qSnap.forEach((d) => {
          deletePromises.push(deleteDoc(doc(db, "team", d.id)))
        })
        await Promise.all(deletePromises)
      }

      // 3. Delete associated storage object if path exists
      if (member.storagePath) {
        deleteObject(ref(storage, member.storagePath)).catch(() => {})
      }

      // 4. Update local state
      setTeamItems(prev => prev.filter(m => (m.id !== member.id && m.name !== member.name)))
      logAction(`Deleted team member: ${member.name}`, "Team")
    } catch (err) {
      console.error("Delete member error:", err)
      alert("Failed to delete team member from Firestore.")
    }
  }

  // Handle FAQ Creation & Delete
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return

    try {
      const faqId = editingFaqId || `faq-${Date.now()}`
      const faqData = {
        id: faqId,
        question: newFaq.question.trim(),
        answer: newFaq.answer.trim(),
        updatedAt: new Date().toISOString()
      }
      await setDoc(doc(db, "faqs", faqId), faqData, { merge: true })
      
      if (editingFaqId) {
        setLocalFaqs(localFaqs.map(f => f.id === editingFaqId ? faqData : f))
        logAction(`Updated FAQ: ${newFaq.question}`, "FAQs")
      } else {
        setLocalFaqs([...localFaqs, faqData])
        logAction(`Created FAQ: ${newFaq.question}`, "FAQs")
      }
      setNewFaq({ question: "", answer: "" })
      setEditingFaqId(null)
    } catch (err) {
      console.error(err)
      alert("Failed to save FAQ.")
    }
  }

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return
    try {
      await deleteDoc(doc(db, "faqs", id))
      setLocalFaqs(localFaqs.filter(f => f.id !== id))
      logAction("Deleted FAQ entry", "FAQs")
    } catch (err) {
      console.error(err)
      alert("Failed to delete FAQ.")
    }
  }

  // CSV Roster Exporter
  const exportRegistrationsCSV = () => {
    if (dbRegistrations.length === 0) {
      alert("No active registration records to export.")
      return
    }
    const headers = ["Registration ID", "Event ID", "User ID", "Payment Status", "Registered Date"]
    const rows = dbRegistrations.map(r => [
      r.registrationId || r.id,
      r.eventId || "N/A",
      r.userId || "N/A",
      r.paymentStatus || "confirmed",
      r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleString() : "N/A"
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `ISTE_Event_Registrations_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    logAction("Exported Event Attendee Roster (CSV)", "Analytics")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground px-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Verifying Administrator Authentication...
        </p>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground px-4">
        <div className="text-center max-w-md glass-panel p-8 rounded-3xl border border-border/80 shadow-2xl">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Administrator Privilege Required</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            {user ? `Currently logged in as ${user.email} (Role: ${user.role}). Administrator role required to access the CMS.` : "Please log in with administrator credentials to access the Executive CMS Command Center."}
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/login")} variant="glow" className="w-full py-4 font-bold text-xs">
              Go to Login Page
            </Button>
            <Button onClick={() => navigate("/dashboard/profile")} variant="outline" className="w-full py-3 font-bold text-xs border-border">
              Return to Student Portal
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Computed Metric Counts
  const upcomingCount = localEvents.filter(e => e.status === "upcoming").length
  const completedCount = localEvents.filter(e => e.status === "completed").length

  return (
    <div className="min-h-screen bg-background text-foreground relative pt-28 sm:pt-32 pb-20 px-4 sm:px-6 transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-[5%] left-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* EXECUTIVE HEADER BAR */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 mb-8 shadow-card backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-primary animate-pulse" /> Cloud Firestore Sync Active
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                  Latency: ~24ms
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-card-foreground dark:text-white mt-1">
                Executive CMS Command Center
              </h1>
              <p className="text-xs text-muted-foreground font-semibold mt-1">
                Project: <span className="text-primary font-mono font-bold">iste-mits-2026</span> • Signed in as: <span className="text-foreground font-bold">{user.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
              <Button
                onClick={refreshAdminData}
                variant="outline"
                disabled={loading}
                className="gap-2 text-xs font-bold py-3 border-border hover:border-primary/40 flex-1 lg:flex-initial"
              >
                <RefreshCw className={`w-4 h-4 text-primary ${loading ? "animate-spin" : ""}`} />
                Refresh Sync
              </Button>
              
              <Button
                onClick={() => navigate("/dashboard/profile")}
                variant="outline"
                className="gap-2 text-xs font-bold py-3 border-border hover:border-secondary/40 flex-1 lg:flex-initial"
              >
                <Users className="w-4 h-4 text-secondary" />
                Student Portal
              </Button>

              <Button
                onClick={() => navigate("/")}
                variant="glow"
                className="gap-2 text-xs font-bold py-3 flex-1 lg:flex-initial"
              >
                Website Public View <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 8 ANALYTICS COMMAND METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {[
            { label: "Total Events", value: localEvents.length, icon: Calendar, color: "text-primary" },
            { label: "Upcoming", value: upcomingCount, icon: Clock, color: "text-emerald-400" },
            { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-cyan-400" },
            { label: "Gallery Assets", value: galleryItems.length, icon: ImageIcon, color: "text-secondary" },
            { label: "Team Members", value: teamItems.length, icon: Users, color: "text-amber-400" },
            { label: "Faculty Mentors", value: staticMentors.length, icon: Shield, color: "text-purple-400" },
            { label: "Registrations", value: dbRegistrations.length, icon: Wallet, color: "text-emerald-400" },
            { label: "FAQs Entries", value: localFaqs.length, icon: HelpCircle, color: "text-rose-400" }
          ].map((m, idx) => {
            const Icon = m.icon
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-panel p-4 rounded-2xl border border-border/80 bg-card/40 dark:bg-slate-900/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider line-clamp-1">{m.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                </div>
                <p className="text-xl sm:text-2xl font-black text-foreground">{m.value}</p>
              </motion.div>
            )
          })}
        </div>

        {/* LAYOUT: SIDEBAR + MAIN CONTENT WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR NAVIGATION (3 COLUMNS) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="glass-panel p-4 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest px-3 py-1">
                MANAGEMENT CONSOLE
              </span>
              
              {[
                { id: "overview", label: "Executive Dashboard", icon: Activity, badge: null },
                { id: "events", label: "Events Manager", icon: Calendar, badge: localEvents.length },
                { id: "gallery", label: "Gallery Assets", icon: ImageIcon, badge: galleryItems.length },
                { id: "team", label: "Team Directory", icon: Users, badge: teamItems.length },
                { id: "faqs", label: "Knowledge FAQs", icon: HelpCircle, badge: localFaqs.length },
                { id: "registrations", label: "Registrations Roster", icon: Wallet, badge: dbRegistrations.length }
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all w-full ${
                      isActive
                        ? "bg-primary text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.25)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== null && (
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isActive ? "bg-slate-950/20 text-slate-950" : "bg-muted text-muted-foreground border border-border/50"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Export Widget */}
            <div className="glass-panel p-5 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40">
              <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Roster Export
              </h4>
              <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed font-medium">
                Download verified attendee registrations in CSV spreadsheet format.
              </p>
              <Button onClick={exportRegistrationsCSV} variant="outline" size="sm" className="w-full gap-2 text-xs font-bold py-2.5 border-border">
                <Download className="w-4 h-4 text-primary" /> Export CSV File
              </Button>
            </div>
          </div>

          {/* MAIN CONTENT WORKSPACE (9 COLUMNS) */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              
              {/* TAB 0: EXECUTIVE OVERVIEW */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-6"
                >
                  {/* Quick Actions Grid */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40">
                    <h3 className="text-base font-extrabold text-foreground mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" /> Quick Administrative Actions
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        onClick={() => setActiveTab("events")}
                        className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border text-left transition-all flex flex-col items-start gap-2 group"
                      >
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">Create Event</span>
                        <span className="text-[10px] text-muted-foreground">Add new fest</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("gallery")}
                        className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border text-left transition-all flex flex-col items-start gap-2 group"
                      >
                        <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">Upload Gallery</span>
                        <span className="text-[10px] text-muted-foreground">Add chapter photos</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("team")}
                        className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border text-left transition-all flex flex-col items-start gap-2 group"
                      >
                        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">Add Team Member</span>
                        <span className="text-[10px] text-muted-foreground">Committee leads</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("faqs")}
                        className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border text-left transition-all flex flex-col items-start gap-2 group"
                      >
                        <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">Edit FAQs</span>
                        <span className="text-[10px] text-muted-foreground">Manage answers</span>
                      </button>
                    </div>
                  </div>

                  {/* Audit Activity Log & System Health */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40">
                      <h3 className="text-sm font-extrabold text-foreground mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Live Audit Log
                      </h3>
                      
                      <div className="flex flex-col gap-3">
                        {activityLogs.map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                            <div>
                              <p className="text-xs font-bold text-foreground">{log.action}</p>
                              <span className="text-[9px] font-extrabold uppercase text-primary">{log.category}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">{log.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-foreground mb-4 flex items-center gap-2">
                          <Database className="w-4 h-4 text-secondary" /> Firestore Architecture Status
                        </h3>
                        
                        <div className="flex flex-col gap-2.5 text-xs font-medium">
                          <div className="flex justify-between py-2 border-b border-border/40">
                            <span className="text-muted-foreground">Project ID</span>
                            <span className="font-mono text-primary font-bold">iste-mits-2026</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border/40">
                            <span className="text-muted-foreground">Database Engine</span>
                            <span className="font-mono text-foreground font-bold">Cloud Firestore (Default)</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border/40">
                            <span className="text-muted-foreground">Storage Bucket</span>
                            <span className="font-mono text-foreground font-bold">iste-mits-2026.appspot.com</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Admin Session Status</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button onClick={refreshAdminData} variant="glow" size="sm" className="w-full justify-center gap-2 mt-4 font-bold text-xs py-3">
                        <RefreshCw className="w-4 h-4" /> Trigger Sync Verification
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 1: EVENTS MANAGER */}
              {activeTab === "events" && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-8"
                >
                  {/* Event Creation Form */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        {editingEventId ? "Edit Event Record" : "Create New Chapter Event"}
                      </h3>
                      {editingEventId && (
                        <button
                          onClick={() => {
                            setEditingEventId(null)
                            setNewEvent({ title: "", category: "Technical Fest", date: "", venue: "", desc: "", status: "upcoming", bannerImage: "" })
                          }}
                          className="text-xs font-bold text-destructive hover:underline"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveEvent} className="flex flex-col gap-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Event Title *</label>
                          <Input
                            required
                            type="text"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            placeholder="e.g. X-Calibre 2025"
                            className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Category *</label>
                          <select
                            value={newEvent.category}
                            onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="Technical Fest">Technical Fest</option>
                            <option value="Mock Placement">Mock Placement</option>
                            <option value="Entrepreneurship Fest">Entrepreneurship Fest</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Hackathon">Hackathon</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Date / Duration *</label>
                          <Input
                            required
                            type="text"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            placeholder="e.g. 26th-28th September 2025"
                            className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Venue *</label>
                          <Input
                            required
                            type="text"
                            value={newEvent.venue}
                            onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                            placeholder="e.g. Seminar Hall & LABS"
                            className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Status *</label>
                          <select
                            value={newEvent.status}
                            onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {/* Banner Image Mode Selector */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Banner Image *</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEventBannerMode("url")}
                              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${eventBannerMode === "url" ? "bg-primary text-slate-950" : "text-muted-foreground"}`}
                            >
                              Image URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setEventBannerMode("file")}
                              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${eventBannerMode === "file" ? "bg-primary text-slate-950" : "text-muted-foreground"}`}
                            >
                              Upload File
                            </button>
                          </div>
                        </div>

                        {eventBannerMode === "url" ? (
                          <Input
                            type="text"
                            value={newEvent.bannerImage}
                            onChange={(e) => setNewEvent({ ...newEvent, bannerImage: e.target.value })}
                            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                            className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                          />
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEventBannerFile(e.target.files?.[0] || null)}
                            className="text-xs text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-bold hover:file:bg-primary/20 cursor-pointer"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Description *</label>
                        <textarea
                          required
                          value={newEvent.desc}
                          onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
                          placeholder="Brief description of the event..."
                          rows={3}
                          className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={eventBannerUploading}
                        variant="glow"
                        className="py-4 font-bold text-xs sm:text-sm justify-center gap-2 rounded-xl mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        {eventBannerUploading ? "Processing Image..." : editingEventId ? "Update Event Record" : "Save & Publish Event"}
                      </Button>
                    </form>
                  </div>

                  {/* Listed Events Grid */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-base font-extrabold text-foreground">
                        Published Events ({localEvents.length})
                      </h3>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Search events..."
                            value={eventSearch}
                            onChange={(e) => setEventSearch(e.target.value)}
                            className="bg-background border-border pl-9 text-xs py-2 rounded-xl"
                          />
                        </div>

                        <select
                          value={eventStatusFilter}
                          onChange={(e) => setEventStatusFilter(e.target.value)}
                          className="rounded-xl bg-background border border-border px-3 py-2 text-xs text-foreground outline-none"
                        >
                          <option value="all">All Status</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {localEvents
                        .filter(e => {
                          const matchesSearch = e.title?.toLowerCase().includes(eventSearch.toLowerCase())
                          if (!matchesSearch) return false
                          if (eventStatusFilter === "upcoming") return e.status === "upcoming"
                          if (eventStatusFilter === "completed") return e.status === "completed"
                          return true
                        })
                        .map((evt) => (
                          <div key={evt.id} className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-border" style={{ backgroundImage: `url(${evt.bannerImage || evt.image || fallbackImage})` }} />
                              <div>
                                <span className={`inline-block text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-1 ${
                                  evt.status === 'upcoming' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'
                                }`}>
                                  {evt.status}
                                </span>
                                <h4 className="font-extrabold text-foreground text-base leading-tight">{evt.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5 font-medium">{evt.date} • {evt.venue}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                              <Button onClick={() => startEditEvent(evt)} variant="outline" size="sm" className="flex-1 text-xs gap-1 py-2">
                                <Edit className="w-3.5 h-3.5 text-primary" /> Edit
                              </Button>
                              <Button onClick={() => handleDeleteEvent(evt.id, evt.title)} variant="destructive" size="sm" className="text-xs gap-1 py-2">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: GALLERY MANAGER */}
              {activeTab === "gallery" && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-8"
                >
                  {/* Upload Form */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-secondary" />
                        {editingGalleryItem ? "Edit Gallery Asset" : "Upload New Gallery Asset"}
                      </h3>
                      {editingGalleryItem && (
                        <button
                          onClick={() => {
                            setEditingGalleryItem(null)
                            setNewGalleryTitle("")
                            setGalleryUrlInput("")
                            setGalleryFile(null)
                          }}
                          className="text-xs font-bold text-destructive hover:underline"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Image Title *</label>
                        <Input
                          type="text"
                          value={newGalleryTitle}
                          onChange={(e) => setNewGalleryTitle(e.target.value)}
                          placeholder="e.g. X-Calibre 2025 Opening Ceremony"
                          className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Category *</label>
                        <select
                          value={newGalleryCategory}
                          onChange={(e) => setNewGalleryCategory(e.target.value)}
                          className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                        >
                          {["Events", "Talks", "Team", "Workshops", "Awards", "Hero Gallery"].map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Upload Method</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setGalleryInputMode("file")}
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold ${galleryInputMode === "file" ? "bg-primary text-slate-950" : "text-muted-foreground"}`}
                          >
                            File Upload
                          </button>
                          <button
                            onClick={() => setGalleryInputMode("url")}
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold ${galleryInputMode === "url" ? "bg-primary text-slate-950" : "text-muted-foreground"}`}
                          >
                            Image URL
                          </button>
                        </div>
                      </div>

                      {galleryInputMode === "file" ? (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
                          className="text-xs text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-bold hover:file:bg-primary/20 cursor-pointer"
                        />
                      ) : (
                        <Input
                          type="text"
                          value={galleryUrlInput}
                          onChange={(e) => setGalleryUrlInput(e.target.value)}
                          placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                          className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                        />
                      )}
                    </div>

                    {galleryError && <p className="text-xs font-bold text-destructive mb-3">{galleryError}</p>}
                    {gallerySuccess && <p className="text-xs font-bold text-emerald-400 mb-3">{gallerySuccess}</p>}

                    <Button onClick={handleGalleryUpload} disabled={galleryUploading} variant="glow" className="py-4 font-bold text-xs sm:text-sm justify-center gap-2 rounded-xl">
                      {galleryUploading ? "Saving Asset..." : editingGalleryItem ? "Update Gallery Image" : "Add to Chapter Gallery"}
                    </Button>
                  </div>

                  {/* Gallery Grid */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40">
                    <h3 className="text-base font-extrabold text-foreground mb-6">
                      Gallery Assets ({galleryItems.length})
                    </h3>

                    {galleryItems.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-2xl p-6">
                        <ImageIcon className="w-8 h-8 text-primary/60 mx-auto mb-2" />
                        <p className="text-sm font-bold text-foreground mb-1">No Gallery Assets in Database</p>
                        <p className="text-xs text-muted-foreground">Use the form above to upload your first chapter gallery photo.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {galleryItems.map((item) => (
                          <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-border aspect-[4/3]">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                              <div>
                                <span className="text-[9px] font-extrabold uppercase text-primary">{item.category}</span>
                                <p className="text-xs font-bold text-white line-clamp-2 mt-0.5">{item.title}</p>
                              </div>
                              <div className="flex items-center gap-1.5 w-full">
                                <Button onClick={() => startEditGallery(item)} variant="outline" size="sm" className="flex-1 text-xs justify-center gap-1 py-1.5 bg-slate-900/80 border-border">
                                  <Edit className="w-3 h-3 text-primary" /> Edit
                                </Button>
                                <Button onClick={() => handleGalleryDelete(item)} variant="destructive" size="sm" className="flex-1 text-xs justify-center gap-1 py-1.5">
                                  <Trash2 className="w-3 h-3" /> Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: TEAM MANAGER */}
              {activeTab === "team" && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-8"
                >
                  {/* Add Member Form */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-400" />
                        {editingMember ? "Edit Team Member" : "Add New Committee Member"}
                      </h3>
                      {editingMember && (
                        <button
                          onClick={() => {
                            setEditingMember(null)
                            setNewMemberName("")
                            setNewMemberRole("")
                            setNewMemberEmail("")
                            setNewMemberLinkedin("")
                          }}
                          className="text-xs font-bold text-destructive hover:underline"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Member Name *</label>
                        <Input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="e.g. Priyanka Sikarwar"
                          className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Role / Designation *</label>
                        <Input
                          type="text"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          placeholder="e.g. Chairperson / Vice Chairperson"
                          className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Committee *</label>
                        <select
                          value={newMemberCommittee}
                          onChange={(e) => setNewMemberCommittee(e.target.value)}
                          className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                        >
                          {[
                            "Accounts Committee",
                            "Technical Committee",
                            "Public Relation Committee",
                            "Marketing Committee",
                            "Graphics Committee",
                            "Management Committee",
                            "Logistics Committee",
                            "Content Committee"
                          ].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">LinkedIn Profile URL (Optional)</label>
                        <Input
                          type="text"
                          value={newMemberLinkedin}
                          onChange={(e) => setNewMemberLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/... (Optional)"
                          className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                        <Input
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="member@mitsgwl.ac.in"
                          className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Profile Photo</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMemberInputMode("file")}
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold ${memberInputMode === "file" ? "bg-primary text-slate-950" : "text-muted-foreground"}`}
                          >
                            File Upload
                          </button>
                          <button
                            onClick={() => setMemberInputMode("url")}
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold ${memberInputMode === "url" ? "bg-primary text-slate-950" : "text-muted-foreground"}`}
                          >
                            Image URL
                          </button>
                        </div>
                      </div>

                      {memberInputMode === "file" ? (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setMemberFile(e.target.files?.[0] || null)}
                          className="text-xs text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-bold hover:file:bg-primary/20 cursor-pointer"
                        />
                      ) : (
                        <Input
                          type="text"
                          value={memberUrlInput}
                          onChange={(e) => setMemberUrlInput(e.target.value)}
                          placeholder="Paste photo URL"
                          className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                        />
                      )}
                    </div>

                    {memberError && <p className="text-xs font-bold text-destructive mb-3">{memberError}</p>}
                    {memberSuccess && <p className="text-xs font-bold text-emerald-400 mb-3">{memberSuccess}</p>}

                    <Button onClick={handleMemberSave} disabled={memberUploading} variant="glow" className="py-4 font-bold text-xs sm:text-sm justify-center gap-2 rounded-xl">
                      {memberUploading ? "Saving Member..." : editingMember ? "Update Member Profile" : "Add to Team Directory"}
                    </Button>
                  </div>

                  {/* Team Members Grid */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40">
                    <h3 className="text-base font-extrabold text-foreground mb-6">
                      Team Directory ({teamItems.length})
                    </h3>

                    {teamItems.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-2xl p-6">
                        <Users className="w-8 h-8 text-primary/60 mx-auto mb-2" />
                        <p className="text-sm font-bold text-foreground mb-1">No Team Members in Database</p>
                        <p className="text-xs text-muted-foreground">Use the form above to add your first steering committee member.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {teamItems.map((m) => (
                          <div key={m.id} className="glass-panel p-5 rounded-2xl border border-border/80 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0 border border-border" style={{ backgroundImage: `url(${m.img || fallbackImage})` }} />
                              <div>
                                <span className="text-[9px] font-extrabold uppercase text-amber-400">{m.committee}</span>
                                <h4 className="font-extrabold text-foreground text-sm leading-tight">{m.name}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{m.role}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button onClick={() => startEditMember(m)} className="p-1.5 hover:bg-muted rounded-lg text-primary">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleMemberDelete(m)} className="p-1.5 hover:bg-muted rounded-lg text-destructive">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: FAQS EDITOR */}
              {activeTab === "faqs" && (
                <motion.div
                  key="faqs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-8"
                >
                  {/* Add FAQ Form */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40">
                    <h3 className="text-base font-extrabold text-foreground mb-6 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-purple-400" />
                      {editingFaqId ? "Edit Knowledge FAQ" : "Add New Knowledge FAQ"}
                    </h3>

                    <form onSubmit={handleSaveFaq} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Question *</label>
                        <Input
                          required
                          type="text"
                          value={newFaq.question}
                          onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                          placeholder="e.g. How do I join the ISTE MITS Student Chapter?"
                          className="bg-background border-border/80 py-3 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Answer *</label>
                        <textarea
                          required
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                          placeholder="Detailed answer explaining chapter procedures..."
                          rows={3}
                          className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground outline-none resize-none"
                        />
                      </div>

                      <Button type="submit" variant="glow" className="py-4 font-bold text-xs sm:text-sm justify-center gap-2 rounded-xl">
                        {editingFaqId ? "Update FAQ Entry" : "Save FAQ Entry"}
                      </Button>
                    </form>
                  </div>

                  {/* FAQs List */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40">
                    <h3 className="text-base font-extrabold text-foreground mb-6">
                      Published FAQs ({localFaqs.length})
                    </h3>

                    <div className="flex flex-col gap-3">
                      {localFaqs.map((faq) => (
                        <div key={faq.id} className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-foreground text-sm">{faq.question}</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{faq.answer}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingFaqId(faq.id)
                                setNewFaq({ question: faq.question, answer: faq.answer })
                              }}
                              className="p-1.5 hover:bg-muted rounded-lg text-primary"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteFaq(faq.id)} className="p-1.5 hover:bg-muted rounded-lg text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: REGISTRATIONS ROSTER */}
              {activeTab === "registrations" && (
                <motion.div
                  key="registrations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-card/40 dark:bg-slate-900/40"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-base font-extrabold text-foreground">
                        Event Registrations Roster ({dbRegistrations.length})
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Real-time attendee enrollments stored in Cloud Firestore.</p>
                    </div>

                    <Button onClick={exportRegistrationsCSV} variant="outline" size="sm" className="gap-2 text-xs font-bold">
                      <Download className="w-4 h-4 text-primary" /> Download CSV
                    </Button>
                  </div>

                  {dbRegistrations.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-xs font-semibold">
                      No event registrations recorded in Firestore yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/80 text-muted-foreground font-extrabold uppercase">
                            <th className="py-3 px-3">Registration ID</th>
                            <th className="py-3 px-3">Event</th>
                            <th className="py-3 px-3">User ID</th>
                            <th className="py-3 px-3">Payment / Entry</th>
                            <th className="py-3 px-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-medium">
                          {dbRegistrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-muted/20">
                              <td className="py-3 px-3 font-mono font-bold text-primary">{reg.registrationId || reg.id}</td>
                              <td className="py-3 px-3 font-bold text-foreground">{reg.eventTitle || reg.eventId}</td>
                              <td className="py-3 px-3 font-mono text-muted-foreground">{reg.userId?.substr(0, 10)}...</td>
                              <td className="py-3 px-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {reg.paymentStatus || "confirmed"}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-muted-foreground">
                                {reg.createdAt ? new Date(reg.createdAt.seconds ? reg.createdAt.seconds * 1000 : reg.createdAt).toLocaleDateString() : "Active"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
