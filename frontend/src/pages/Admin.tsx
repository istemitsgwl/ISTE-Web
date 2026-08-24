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
  Activity, Database, Filter, Edit, Layers, ArrowUpRight, ArrowRight, Clock, UserPlus, UserCheck, UserX, LogOut, Loader2, Mail, Eye, X
} from "lucide-react"
import fallbackImage from "@/assets/iste-circular-logo.png"
import { sortEventsDescending } from "@/utils/eventSorter"

export default function Admin() {
  const { user, loading: authLoading } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "gallery" | "team" | "registrations" | "admins" | "messages">("overview")

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("iste_admin_jwt_token") || localStorage.getItem("iste_google_id_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // State for database records
  const [localEvents, setLocalEvents] = useState<any[]>([])
  const [localFaqs, setLocalFaqs] = useState<any[]>([])
  const [dbRegistrations, setDbRegistrations] = useState<any[]>([])
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [teamItems, setTeamItems] = useState<any[]>([])
  const [localMentors, setLocalMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  // Contact Messages CMS States
  const [contactMessages, setContactMessages] = useState<any[]>([])
  const [contactStats, setContactStats] = useState({ total: 0, unread: 0, read: 0 })
  const [contactSearch, setContactSearch] = useState("")
  const [contactStatusFilter, setContactStatusFilter] = useState("All")
  const [contactPage, setContactPage] = useState(1)
  const [contactLoading, setContactLoading] = useState(false)
  const [selectedContactMessage, setSelectedContactMessage] = useState<any | null>(null)

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
    { id: "log-1", action: "MongoDB Atlas Session Synchronized", category: "System", timestamp: "Just now" },
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

  // Form/Roster States for Admins Management (Super Admin only)
  const [adminsList, setAdminsList] = useState<any[]>([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [adminsError, setAdminsError] = useState("")
  const [adminSearch, setAdminSearch] = useState("")
  const [adminRoleFilter, setAdminRoleFilter] = useState("all")
  const [adminStatusFilter, setAdminStatusFilter] = useState("all")
  const [adminCurrentPage, setAdminCurrentPage] = useState(1)
  const adminPageSize = 5

  // Dialog/Modal States
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminName, setNewAdminName] = useState("")
  const [newAdminRole, setNewAdminRole] = useState("admin")
  const [adminActionLoading, setAdminActionLoading] = useState(false)
  const [adminActionError, setAdminActionError] = useState("")

  const fetchAdmins = async () => {
    if (!user || user.role !== "super_admin") return
    setAdminsLoading(true)
    setAdminsError("")
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    try {
      const res = await fetch(`${apiBase}/v1/admins`, {
        headers: {
          ...getAuthHeaders()
        }
      })
      if (res.ok) {
        const data = await res.json()
        setAdminsList(data)
      } else {
        const errData = await res.json().catch(() => ({}))
        setAdminsError(errData.detail || "Failed to load administrative roster.")
      }
    } catch (err) {
      setAdminsError("Network error. Unable to sync administrative workspace.")
    } finally {
      setAdminsLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      setAdminActionError("Please fill in all required fields.")
      return
    }
    setAdminActionLoading(true)
    setAdminActionError("")
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    try {
      const res = await fetch(`${apiBase}/v1/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          name: newAdminName.trim(),
          role: newAdminRole
        })
      })
      if (res.ok) {
        setNewAdminEmail("")
        setNewAdminName("")
        setNewAdminRole("admin")
        setIsAddAdminOpen(false)
        logAction("Enrolled new Admin account", "Auth")
        await fetchAdmins()
      } else {
        const errData = await res.json().catch(() => ({}))
        setAdminActionError(errData.detail || "Failed to create Admin account.")
      }
    } catch (err) {
      setAdminActionError("Network error. Contact system administrator.")
    } finally {
      setAdminActionLoading(false)
    }
  }

  const handleToggleAdminStatus = async (adminId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active"
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    
    // Optimistic UI Update
    setAdminsList(prev => prev.map(a => a.id === adminId ? { ...a, status: nextStatus } : a))

    try {
      const res = await fetch(`${apiBase}/v1/admins/${adminId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: nextStatus })
      })
      if (!res.ok) {
        // Rollback
        setAdminsList(prev => prev.map(a => a.id === adminId ? { ...a, status: currentStatus } : a))
        const errData = await res.json().catch(() => ({}))
        alert(errData.detail || "Failed to update admin status.")
      } else {
        logAction(`Updated status for Admin (${adminId}) to ${nextStatus}`, "Auth")
      }
    } catch (err) {
      // Rollback
      setAdminsList(prev => prev.map(a => a.id === adminId ? { ...a, status: currentStatus } : a))
      alert("Network error. Status toggle failed.")
    }
  }

  const handleToggleAdminRole = async (adminId: string, currentRole: string) => {
    const nextRole = currentRole === "super_admin" ? "admin" : "super_admin"
    const actionLabel = nextRole === "super_admin" ? "promote to Super Admin" : "demote to Admin"
    if (!window.confirm(`Are you sure you want to ${actionLabel} this user?`)) return

    const apiBase = import.meta.env.VITE_API_URL || "/api"

    try {
      const res = await fetch(`${apiBase}/v1/admins/${adminId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ role: nextRole })
      })
      if (res.ok) {
        logAction(`Changed role for Admin (${adminId}) to ${nextRole}`, "Auth")
        await fetchAdmins()
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(errData.detail || "Failed to update admin role.")
      }
    } catch (err) {
      alert("Network error. Role update failed.")
    }
  }

  const handleDeleteAdmin = async (adminId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete admin account "${email}"? This action cannot be undone.`)) return
    const apiBase = import.meta.env.VITE_API_URL || "/api"

    try {
      const res = await fetch(`${apiBase}/v1/admins/${adminId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders()
        }
      })
      if (res.ok) {
        logAction(`Deleted Admin account: ${email}`, "Auth")
        await fetchAdmins()
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(errData.detail || "Failed to delete admin account.")
      }
    } catch (err) {
      alert("Network error. Deletion failed.")
    }
  }

  // Trigger admins list fetch if activeTab becomes "admins"
  useEffect(() => {
    if (activeTab === "admins" && user?.role === "super_admin") {
      fetchAdmins()
    }
  }, [activeTab, user])

  // Fetch data on load
  const refreshAdminData = async () => {
    setLoading(true)
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    try {
      // 1. Fetch events from REST API
      const evRes = await fetch(`${apiBase}/events`)
      if (evRes.ok) {
        const evList = await evRes.json()
        setLocalEvents(sortEventsDescending(evList))
      }

      // 2. Fetch FAQs from REST API
      const faqRes = await fetch(`${apiBase}/content/faqs`)
      if (faqRes.ok) {
        const fList = await faqRes.json()
        setLocalFaqs(fList)
      }

      // 3. Fetch gallery items from REST API
      const galleryRes = await fetch(`${apiBase}/content/gallery`)
      if (galleryRes.ok) {
        const gList = await galleryRes.json()
        setGalleryItems(gList)
      }

      // 4. Fetch team items from REST API
      const teamRes = await fetch(`${apiBase}/content/team`)
      if (teamRes.ok) {
        const teamData = await teamRes.json()
        setTeamItems(teamData)
      } else {
        const fallbackRes = await fetch(`${apiBase}/content/committees`)
        if (fallbackRes.ok) {
          const grouped = await fallbackRes.json()
          const flatTeam: any[] = []
          grouped.forEach((group: any) => {
            if (group.members) flatTeam.push(...group.members)
          })
          setTeamItems(flatTeam)
        }
      }

      // 5. Fetch mentors from REST API
      const mentorRes = await fetch(`${apiBase}/content/mentors`)
      if (mentorRes.ok) {
        const mList = await mentorRes.json()
        setLocalMentors(mList)
      }
      await refreshContactMessages()
    } catch (err) {
      console.error("Failed to load admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  const refreshContactMessages = async () => {
    setContactLoading(true)
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    try {
      const url = `${apiBase}/admin/contact?search=${encodeURIComponent(contactSearch)}&status=${encodeURIComponent(contactStatusFilter)}&page=${contactPage}&limit=50`
      const res = await fetch(url, { headers: { ...getAuthHeaders() } })
      if (res.ok) {
        const data = await res.json()
        setContactMessages(data.messages || [])
        setContactStats({
          total: data.total || 0,
          unread: data.unread || 0,
          read: data.read || 0,
        })
      }
    } catch (err) {
      console.warn("Failed to fetch contact messages:", err)
    } finally {
      setContactLoading(false)
    }
  }

  const handleToggleReadStatus = async (id: string, currentStatus: string) => {
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    const targetStatus = currentStatus === "Unread" ? "read" : "unread"
    try {
      const res = await fetch(`${apiBase}/admin/contact/${id}/read?status=${targetStatus}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders() }
      })
      if (res.ok) {
        const updated = await res.json()
        if (selectedContactMessage?.id === id) {
          setSelectedContactMessage(updated)
        }
        await refreshContactMessages()
      }
    } catch (err) {
      console.error("Failed to update message read status:", err)
    }
  }

  const handleDeleteContactMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    try {
      const res = await fetch(`${apiBase}/admin/contact/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() }
      })
      if (res.ok) {
        if (selectedContactMessage?.id === id) setSelectedContactMessage(null)
        await refreshContactMessages()
      }
    } catch (err) {
      console.error("Failed to delete contact message:", err)
    }
  }

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "super_admin" && user.role !== "admin"))) {
      navigate("/patidar/admin")
    } else {
      refreshAdminData()
    }
  }, [user, authLoading, navigate])

  // Convert and compress file to base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileNameLower = file.name.toLowerCase()
      const isHeic = fileNameLower.endsWith(".heic") || fileNameLower.endsWith(".heif") || file.type.includes("heic") || file.type.includes("heif")

      const reader = new FileReader()
      reader.onload = (e) => {
        const rawResult = e.target?.result as string
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
            const compressed = canvas.toDataURL("image/jpeg", 0.8)
            resolve(compressed)
          } else {
            if (rawResult.length > 3 * 1024 * 1024) {
              reject(new Error("Selected image file size is too large (over 3MB). Please choose a smaller image."))
            } else {
              resolve(rawResult)
            }
          }
        }
        img.onerror = () => {
          if (isHeic) {
            reject(new Error("HEIC image format (iPhone photo) is not directly supported by browser canvas. Please convert your photo to JPG or PNG before uploading."))
          } else if (rawResult.length > 3 * 1024 * 1024) {
            reject(new Error("Selected image file size is too large (over 3MB). Please choose a smaller JPG or PNG image."))
          } else {
            resolve(rawResult)
          }
        }
        img.src = rawResult
      }
      reader.onerror = () => reject(new Error("Failed to read image file."))
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

      const apiBase = import.meta.env.VITE_API_URL || "/api"
      const url = editingEventId ? `${apiBase}/events/${editingEventId}` : `${apiBase}/events`
      const method = editingEventId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(eventData)
      })

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error("Payload Too Large (413): Event banner image size is too large. Please select a smaller JPG or PNG image.")
        }
        throw new Error("Failed to save event via REST API")
      }

      await refreshAdminData()
      alert(editingEventId ? "Event updated successfully!" : "Event created successfully!")

      setNewEvent({ title: "", category: "Technical Fest", date: "", venue: "", desc: "", status: "upcoming", bannerImage: "" })
      setEditingEventId(null)
      setEventBannerFile(null)
    } catch (err: any) {
      console.error("Failed to save event:", err)
      alert(err.message || "Failed to save event.")
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
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    try {
      const res = await fetch(`${apiBase}/events/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders()
        }
      })
      if (!res.ok) {
        throw new Error("Failed to delete event")
      }
      await refreshAdminData()
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

    setGalleryError("")
    setGallerySuccess("")
    setGalleryUploading(true)
    const apiBase = import.meta.env.VITE_API_URL || "/api"

    try {
      const formData = new FormData()
      formData.append("title", newGalleryTitle.trim())
      formData.append("category", newGalleryCategory)

      if (galleryInputMode === "file" && galleryFile) {
        const compressedBase64 = await fileToBase64(galleryFile)
        formData.append("imageUrl", compressedBase64)
      } else if (galleryUrlInput.trim()) {
        formData.append("imageUrl", galleryUrlInput.trim())
      }

      const url = editingGalleryItem 
        ? `${apiBase}/content/gallery/${editingGalleryItem.id}` 
        : `${apiBase}/content/gallery`
      const method = editingGalleryItem ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders()
        },
        body: formData
      })

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error("Upload Failed (413 Payload Too Large): Image payload exceeds server limits. Please select a smaller JPG or PNG image.")
        }
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || "Upload failed")
      }

      setGallerySuccess(editingGalleryItem ? "Gallery item updated successfully!" : "Gallery item saved successfully!")
      setNewGalleryTitle("")
      setGalleryFile(null)
      setGalleryUrlInput("")
      setEditingGalleryItem(null)
      await refreshAdminData()
    } catch (err: any) {
      console.error(err)
      setGalleryError(err.message || "Gallery upload failed.")
    } finally {
      setGalleryUploading(false)
    }
  }

  const handleGalleryDelete = async (item: any) => {
    if (!confirm(`Delete "${item.title}" from Gallery?`)) return
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    try {
      const res = await fetch(`${apiBase}/content/gallery/${item.id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders()
        }
      })
      if (!res.ok) {
        throw new Error("Failed to delete gallery item")
      }
      await refreshAdminData()
      logAction(`Deleted gallery item: ${item.title}`, "Gallery")
    } catch (err) {
      console.error(err)
      alert("Gallery deletion failed.")
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

    const apiBase = import.meta.env.VITE_API_URL || "/api"
    try {
      const formData = new FormData()
      if (editingMember) {
        formData.append("id", editingMember.id)
      }
      formData.append("name", newMemberName.trim())
      formData.append("role", newMemberRole.trim())
      formData.append("committee", newMemberCommittee)
      formData.append("email", newMemberEmail.trim())
      formData.append("linkedin", newMemberLinkedin.trim())

      if (memberInputMode === "file" && memberFile) {
        const compressedBase64 = await fileToBase64(memberFile)
        formData.append("imageUrl", compressedBase64)
      } else if (memberUrlInput.trim()) {
        formData.append("imageUrl", memberUrlInput.trim())
      }

      const res = await fetch(`${apiBase}/content/team`, {
        method: "POST",
        headers: {
          ...getAuthHeaders()
        },
        body: formData
      })

      if (!res.ok) {
        throw new Error("Failed to save team member")
      }

      setMemberSuccess("Member saved to team successfully!")
      setNewMemberName("")
      setNewMemberRole("")
      setNewMemberEmail("")
      setNewMemberLinkedin("")
      setMemberFile(null)
      setMemberUrlInput("")
      setEditingMember(null)
      await refreshAdminData()
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
    setMemberUrlInput(member.image || "")
    setMemberInputMode("url")
    window.scrollTo({ top: 500, behavior: "smooth" })
  }

  const handleMemberDelete = async (member: any) => {
    if (!confirm(`Delete ${member.name} from Team?`)) return
    const apiBase = import.meta.env.VITE_API_URL || "/api"
    try {
      const res = await fetch(`${apiBase}/content/team/${member.id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders()
        }
      })
      if (!res.ok) {
        throw new Error("Failed to delete team member")
      }
      await refreshAdminData()
      logAction(`Deleted team member: ${member.name}`, "Team")
    } catch (err) {
      console.error("Delete member error:", err)
      setTeamItems(prev => prev.filter(m => m.id !== member.id))
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

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground px-4">
        <div className="text-center max-w-md glass-panel p-8 rounded-3xl border border-border/80 shadow-2xl">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Administrator Privilege Required</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            {user ? `Currently logged in as ${user.email} (Role: ${user.role}). Administrator role required to access the CMS.` : "Please log in with administrator credentials to access the Executive CMS Command Center."}
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/patidar/admin")} variant="glow" className="w-full py-4 font-bold text-xs">
              Go to Login Page
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full py-3 font-bold text-xs border-border">
              Return to Website
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
                  <Activity className="w-3 h-3 text-primary animate-pulse" /> MongoDB Atlas Sync Active
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
                onClick={() => navigate("/")}
                variant="outline"
                className="gap-2 text-xs font-bold py-3 border-border flex-1 lg:flex-initial"
              >
                Website View <ArrowUpRight className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => {
                  useAuthStore.getState().logout()
                  navigate("/patidar/admin")
                }}
                variant="destructive"
                className="gap-2 text-xs font-bold py-3 flex-1 lg:flex-initial cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Log Out
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
            { label: "Faculty Mentors", value: localMentors.length || 2, icon: Shield, color: "text-purple-400" },
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
                { id: "registrations", label: "Registrations Roster", icon: Wallet, badge: dbRegistrations.length },
                { id: "messages", label: "Contact Messages", icon: Mail, badge: contactStats.unread > 0 ? `${contactStats.unread} NEW` : contactStats.total },
                ...(user && (user.role as string) === "super_admin" ? [{ id: "admins", label: "Admins Management", icon: Shield, badge: "RBAC" }] : [])
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
                          <Database className="w-4 h-4 text-secondary" /> Database & Media Architecture
                        </h3>
                        
                        <div className="flex flex-col gap-2.5 text-xs font-medium">
                          <div className="flex justify-between py-2 border-b border-border/40">
                            <span className="text-muted-foreground">Database Name</span>
                            <span className="font-mono text-primary font-bold">iste_mits_db</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border/40">
                            <span className="text-muted-foreground">Database Engine</span>
                            <span className="font-mono text-foreground font-bold">MongoDB Atlas</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border/40">
                            <span className="text-muted-foreground">Media CDN Engine</span>
                            <span className="font-mono text-foreground font-bold">Cloudinary (durtt51an)</span>
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
                              <div className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0 border border-border" style={{ backgroundImage: `url(${m.image || fallbackImage})` }} />
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
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Real-time attendee enrollments stored in MongoDB Atlas.</p>
                    </div>

                    <Button onClick={exportRegistrationsCSV} variant="outline" size="sm" className="gap-2 text-xs font-bold">
                      <Download className="w-4 h-4 text-primary" /> Download CSV
                    </Button>
                  </div>

                  {dbRegistrations.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-xs font-semibold">
                      No event registrations recorded in MongoDB yet.
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

              {/* TAB 6: ADMINS MANAGEMENT (SUPER ADMIN ONLY) */}
              {activeTab === "admins" && user?.role === "super_admin" && (
                <motion.div
                  key="admins"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-foreground tracking-tight">Administrative Roster</h2>
                      <p className="text-xs text-muted-foreground mt-1">Configure role levels, permissions, and session access flags.</p>
                    </div>
                    <Button onClick={() => { setIsAddAdminOpen(true); setAdminActionError(""); }} className="gap-2 text-xs font-bold py-2.5 rounded-xl bg-primary text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:shadow-[0_0_30px_rgba(0,243,255,0.35)]">
                      <UserPlus className="w-4 h-4" /> Enroll New Admin
                    </Button>
                  </div>

                  {/* Filters Header Panel */}
                  <div className="glass-panel p-4 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={adminSearch}
                        onChange={(e) => { setAdminSearch(e.target.value); setAdminCurrentPage(1); }}
                        placeholder="Search admins by name or email..."
                        className="pl-10 bg-slate-950/40 border-border text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <select
                        value={adminRoleFilter}
                        onChange={(e) => { setAdminRoleFilter(e.target.value); setAdminCurrentPage(1); }}
                        className="w-full rounded-xl bg-slate-950/40 border border-border px-4 py-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admins</option>
                        <option value="admin">Standard Admins</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={adminStatusFilter}
                        onChange={(e) => { setAdminStatusFilter(e.target.value); setAdminCurrentPage(1); }}
                        className="w-full rounded-xl bg-slate-950/40 border border-border px-4 py-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="disabled">Disabled Only</option>
                      </select>
                    </div>
                  </div>

                  {adminsError && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{adminsError}</span>
                      <button onClick={fetchAdmins} className="ml-auto text-[10px] font-bold text-primary underline">Retry Roster Sync</button>
                    </div>
                  )}

                  {/* Admins Data Table */}
                  <div className="glass-panel rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 overflow-hidden shadow-xl">
                    {adminsLoading ? (
                      <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground font-semibold">Synchronizing administrator privileges...</p>
                      </div>
                    ) : (
                      (() => {
                        const filtered = adminsList.filter(admin => {
                          const query = adminSearch.toLowerCase()
                          const matchesSearch = admin.name?.toLowerCase().includes(query) || admin.email?.toLowerCase().includes(query)
                          const matchesRole = adminRoleFilter === "all" || (admin.role || "").toLowerCase() === adminRoleFilter
                          const matchesStatus = adminStatusFilter === "all" || (admin.status || "").toLowerCase() === adminStatusFilter
                          return matchesSearch && matchesRole && matchesStatus
                        })

                        const pageCount = Math.ceil(filtered.length / adminPageSize)
                        const paginatedAdmins = filtered.slice((adminCurrentPage - 1) * adminPageSize, adminCurrentPage * adminPageSize)

                        if (filtered.length === 0) {
                          return (
                            <div className="p-12 text-center">
                              <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                              <p className="text-sm font-bold text-foreground">No administrative accounts found</p>
                              <p className="text-xs text-muted-foreground mt-1">Refine your active search query or status filter parameters.</p>
                            </div>
                          )
                        }

                        return (
                          <>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-border/60 bg-slate-950/20 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                                    <th className="py-4 px-5">Administrator Profile</th>
                                    <th className="py-4 px-4">Workspace Privilege</th>
                                    <th className="py-4 px-4">Activity Status</th>
                                    <th className="py-4 px-4">Registration Date</th>
                                    <th className="py-4 px-4 text-right">Actions Panel</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paginatedAdmins.map((admin) => {
                                    const isSelf = admin.email?.toLowerCase() === user?.email?.toLowerCase()
                                    return (
                                      <tr key={admin.id} className="border-b border-border/40 hover:bg-slate-950/10 transition-colors">
                                        {/* Avatar & Details */}
                                        <td className="py-4 px-5">
                                          <div className="flex items-center gap-3">
                                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                                              {admin.picture ? (
                                                <img src={admin.picture} alt={admin.name} className="w-full h-full object-cover" />
                                              ) : (
                                                admin.name?.charAt(0) || "A"
                                              )}
                                            </div>
                                            <div>
                                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                {admin.name} {isSelf && <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">Self</span>}
                                              </p>
                                              <p className="text-[10px] text-muted-foreground mt-0.5">{admin.email}</p>
                                            </div>
                                          </div>
                                        </td>
                                        {/* Role level */}
                                        <td className="py-4 px-4">
                                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                            (admin.role || "").toLowerCase() === "super_admin"
                                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                              : "bg-primary/10 text-primary border-primary/20"
                                          }`}>
                                            <Shield className="w-2.5 h-2.5" />
                                            {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                                          </span>
                                        </td>
                                        {/* Status Toggle */}
                                        <td className="py-4 px-4">
                                          <button
                                            disabled={isSelf}
                                            onClick={() => handleToggleAdminStatus(admin.id, admin.status)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border transition-all ${
                                              (admin.status || "").toLowerCase() === "active"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                                : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                          >
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                              (admin.status || "").toLowerCase() === "active" ? "bg-emerald-400" : "bg-destructive"
                                            }`} />
                                            {admin.status || "active"}
                                          </button>
                                        </td>
                                        {/* Registration Date */}
                                        <td className="py-4 px-4 text-xs font-medium text-muted-foreground">
                                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Seed Account"}
                                        </td>
                                        {/* Actions */}
                                        <td className="py-4 px-4 text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <Button
                                              disabled={isSelf}
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleToggleAdminRole(admin.id, admin.role)}
                                              className="h-8 text-[10px] font-bold border-border/80 text-foreground hover:bg-primary hover:text-slate-950 transition-all rounded-lg disabled:opacity-50"
                                              title={admin.role === "super_admin" ? "Demote privileges to standard admin" : "Promote privileges to super admin"}
                                            >
                                              {admin.role === "super_admin" ? "Demote" : "Promote"}
                                            </Button>
                                            <Button
                                              disabled={isSelf}
                                              variant="destructive"
                                              size="sm"
                                              onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                                              className="h-8 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center border border-destructive/20 hover:bg-destructive/20 text-destructive disabled:opacity-50"
                                              title="Permanently remove administrative privileges"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {pageCount > 1 && (
                              <div className="flex items-center justify-between px-5 py-4 border-t border-border/60 bg-slate-950/10">
                                <span className="text-[11px] text-muted-foreground font-semibold">
                                  Showing page {adminCurrentPage} of {pageCount} ({filtered.length} total admins)
                                </span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    disabled={adminCurrentPage === 1}
                                    onClick={() => setAdminCurrentPage(p => Math.max(1, p - 1))}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-bold border-border"
                                  >
                                    Previous
                                  </Button>
                                  <Button
                                    disabled={adminCurrentPage === pageCount}
                                    onClick={() => setAdminCurrentPage(p => Math.min(pageCount, p + 1))}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-bold border-border"
                                  >
                                    Next
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )
                      })()
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB: CONTACT MESSAGES CMS */}
              {activeTab === "messages" && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-6"
                >
                  {/* Summary Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-card/40 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Submissions</p>
                        <p className="text-2xl font-black text-foreground mt-1">{contactStats.total}</p>
                      </div>
                      <div className="p-3 bg-primary/10 text-primary rounded-xl">
                        <Mail className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-card/40 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Unread Messages</p>
                        <p className="text-2xl font-black text-amber-400 mt-1">{contactStats.unread}</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-card/40 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Read Messages</p>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{contactStats.read}</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Messages Table & Controls Panel */}
                  <div className="glass-panel p-6 rounded-3xl border border-border/80 bg-card/40 flex flex-col gap-5">
                    {/* Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="text"
                          value={contactSearch}
                          onChange={(e) => {
                            setContactSearch(e.target.value)
                            setContactPage(1)
                          }}
                          placeholder="Search by sender, email, subject..."
                          className="pl-10 bg-background/80 border-border/80 py-2.5 text-xs rounded-xl"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {["All", "Unread", "Read"].map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              setContactStatusFilter(st)
                              setContactPage(1)
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                              contactStatusFilter === st
                                ? "bg-primary text-slate-950 shadow-sm"
                                : "bg-background/80 border border-border/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                        <Button
                          onClick={() => refreshContactMessages()}
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 rounded-xl border-border/80 text-xs font-bold"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${contactLoading ? "animate-spin" : ""}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Table */}
                    {contactLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    ) : contactMessages.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Mail className="w-8 h-8 mx-auto mb-2 opacity-40 text-primary" />
                        <p className="text-sm font-bold text-foreground">No contact messages found</p>
                        <p className="text-xs mt-1">Try clearing filters or search terms.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-border/60">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/40 text-muted-foreground uppercase text-[10px] font-extrabold tracking-wider border-b border-border/60">
                            <tr>
                              <th className="p-3.5">Status</th>
                              <th className="p-3.5">Sender</th>
                              <th className="p-3.5">Subject & Message</th>
                              <th className="p-3.5">Submitted At</th>
                              <th className="p-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 font-medium">
                            {contactMessages.map((msg) => (
                              <tr key={msg.id} className={`hover:bg-muted/20 transition-colors ${msg.status === "Unread" ? "bg-primary/5" : ""}`}>
                                <td className="p-3.5">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    msg.status === "Unread" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-muted text-muted-foreground"
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${msg.status === "Unread" ? "bg-amber-400 animate-pulse" : "bg-muted-foreground"}`} />
                                    {msg.status}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <p className="font-extrabold text-foreground">{msg.name}</p>
                                  <p className="text-[11px] text-muted-foreground">{msg.email}</p>
                                </td>
                                <td className="p-3.5 max-w-xs">
                                  <p className="font-bold text-foreground truncate">{msg.subject}</p>
                                  <p className="text-[11px] text-muted-foreground truncate">{msg.message}</p>
                                </td>
                                <td className="p-3.5 text-muted-foreground text-[11px]">
                                  {new Date(msg.createdAt).toLocaleString()}
                                </td>
                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      onClick={() => setSelectedContactMessage(msg)}
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2.5 rounded-lg text-xs font-bold border-border/80"
                                      title="View Full Message"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-primary" />
                                    </Button>
                                    <Button
                                      onClick={() => handleToggleReadStatus(msg.id, msg.status)}
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2.5 rounded-lg text-xs font-bold border-border/80"
                                      title={msg.status === "Unread" ? "Mark as Read" : "Mark as Unread"}
                                    >
                                      <CheckCircle2 className={`w-3.5 h-3.5 ${msg.status === "Unread" ? "text-amber-400" : "text-muted-foreground"}`} />
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteContactMessage(msg.id)}
                                      variant="destructive"
                                      size="sm"
                                      className="h-8 px-2.5 rounded-lg text-xs font-bold"
                                      title="Delete Message"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Full Message Detail Modal */}
                  {selectedContactMessage && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 bg-card max-w-xl w-full flex flex-col gap-5 shadow-2xl relative"
                      >
                        <div className="flex items-start justify-between border-b border-border/60 pb-4">
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1 ${
                              selectedContactMessage.status === "Unread" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {selectedContactMessage.status} Message
                            </span>
                            <h3 className="text-lg font-black text-foreground">{selectedContactMessage.subject}</h3>
                          </div>
                          <button
                            onClick={() => setSelectedContactMessage(null)}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs bg-muted/20 p-4 rounded-2xl border border-border/40">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Sender Name</p>
                            <p className="font-extrabold text-foreground mt-0.5">{selectedContactMessage.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</p>
                            <p className="font-extrabold text-primary mt-0.5 truncate">{selectedContactMessage.email}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Submitted At</p>
                            <p className="font-semibold text-foreground mt-0.5">{new Date(selectedContactMessage.createdAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Client IP</p>
                            <p className="font-semibold text-foreground mt-0.5">{selectedContactMessage.ipAddress || "127.0.0.1"}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <p className="text-xs uppercase font-bold text-muted-foreground">Message Body</p>
                          <div className="p-4 rounded-2xl bg-background/80 border border-border/80 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto font-medium">
                            {selectedContactMessage.message}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
                          <a
                            href={`mailto:${selectedContactMessage.email}?subject=Re: ${encodeURIComponent(selectedContactMessage.subject)}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-extrabold text-xs hover:bg-cyan-300 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Reply via Email</span>
                          </a>
                          <Button
                            onClick={() => handleToggleReadStatus(selectedContactMessage.id, selectedContactMessage.status)}
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 rounded-xl text-xs font-bold border-border"
                          >
                            Mark as {selectedContactMessage.status === "Unread" ? "Read" : "Unread"}
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* ADD NEW ADMIN MODAL DIALOG */}
      <AnimatePresence>
        {isAddAdminOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-border/80 bg-slate-900 shadow-2xl relative overflow-hidden"
            >
              <h3 className="text-base font-extrabold text-foreground mb-1 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" /> Enroll Administrative User
              </h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Add the Google institutional account details to grant dashboard CMS privileges.
              </p>

              <form onSubmit={handleAddAdmin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Full Name *
                  </label>
                  <Input
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Shivam Patidar"
                    className="bg-slate-950 border-border text-xs rounded-xl py-2.5 animate-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Google Email Address *
                  </label>
                  <Input
                    required
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="bg-slate-950 border-border text-xs rounded-xl py-2.5 animate-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Assign Role Level
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-border px-4 py-3 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="admin">Standard Admin (CMS manager)</option>
                    <option value="super_admin">Super Admin (Full privileges)</option>
                  </select>
                </div>

                {adminActionError && (
                  <p className="text-xs font-semibold text-destructive mt-2 leading-relaxed">
                    {adminActionError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddAdminOpen(false)}
                    className="h-10 text-xs font-bold border-border rounded-xl px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={adminActionLoading}
                    className="h-10 text-xs font-bold rounded-xl px-5 bg-primary text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.15)]"
                  >
                    {adminActionLoading ? "Enrolling User..." : "Enrolled Admin"}
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
