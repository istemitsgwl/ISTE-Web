import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, Tag, UserPlus, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"
import { BorderGlowCard } from "@/components/ui/BorderGlowCard"
import { SplitText } from "@/components/animations/SplitText"
import { BlurText } from "@/components/animations/BlurText"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { sortEventsDescending } from "@/utils/eventSorter"
import { resolveEventImage, optimizeCloudinaryUrl } from "@/utils/imageResolver"

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Events() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")
  const [eventList, setEventList] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Registration form responses state
  const [formResponses, setFormResponses] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    let active = true
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/events`)
        if (res.ok && active) {
          const data = await res.json()
          if (data && data.length > 0) {
            setEventList(sortEventsDescending(data))
          }
        }
      } catch (err) {
        console.warn("REST events fetch failed. Using fallback backup.", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchEvents()
    return () => {
      active = false
    }
  }, [])

  const filteredEvents = eventList.filter((event) => {
    if (filter === "all") return true
    if (filter === "upcoming") return event.status === "upcoming"
    if (filter === "completed") return event.status === "completed"
    return true
  })

  const handleRegisterClick = (event: any) => {
    setSelectedEvent(event)
    setFormResponses({})
    setFormError("")
    setRegistrationOpen(true)
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormResponses((prev) => ({ ...prev, [fieldName]: value }))
  }

  const validateForm = () => {
    if (!selectedEvent) return false
    const schema = selectedEvent.customFieldsSchema && selectedEvent.customFieldsSchema.length > 0
      ? selectedEvent.customFieldsSchema
      : [
          { fieldName: "Full Name", fieldType: "text", required: true },
          { fieldName: "Enrollment Number", fieldType: "text", required: true },
          { fieldName: "Branch", fieldType: "text", required: true },
          { fieldName: "Year", fieldType: "select", required: true, options: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          { fieldName: "College Name", fieldType: "text", required: true },
          { fieldName: "Phone Number", fieldType: "text", required: true }
        ]
    for (const field of schema) {
      if (field.required && !formResponses[field.fieldName]) {
        setFormError(`Please fill out the "${field.fieldName}" field.`)
        return false
      }
    }
    setFormError("")
    return true
  }

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return

    if (!validateForm()) return

    setProcessing(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/events/${selectedEvent.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {})
        },
        body: JSON.stringify(formResponses)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || "Registration failed")
      }

      const data = await res.json()
      setProcessing(false)
      setRegistrationOpen(false)
      alert(`Registration Successful for ${selectedEvent.title}!\nRegistration ID: ${data.registrationId || 'ISTE-CONFIRMED'}`)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Registration failed.")
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative pt-32 sm:pt-36 pb-16 px-4 sm:px-6 transition-colors duration-300">
      {/* Background Accent Glows */}
      <div className="absolute top-[10%] left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-1/4 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-12 select-none">
          <div className="mb-6 inline-block">
            <DecryptedText 
              text="LATEST EVENTS" 
              className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
              speed={40} 
              delay={0.1} 
            />
          </div>
          <h1 className="flex flex-col items-center gap-1 sm:gap-2 tracking-tight leading-[1.05] mt-2">
            <SplitText 
              text="Explore Flagship" 
              type="words" 
              className="text-[2.2rem] sm:text-[4rem] md:text-[5rem] font-light font-serif text-card-foreground dark:text-white" 
            />
            <SplitText 
              text="Fests & Tech Drives" 
              type="words" 
              className="font-serif italic font-normal text-[2.75rem] sm:text-[4.5rem] md:text-[5.5rem] bg-gradient-to-r from-primary to-[#6B5BFF] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.1)] dark:drop-shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
            />
          </h1>
          <ScrollReveal delay={0.2} yOffset={15}>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
              Participate in intensive technical workshops, mock preparation forums, and startup pitch fests organized by ISTE.
            </p>
          </ScrollReveal>
        </div>

        {/* Filter Toolbar */}
        <div className="flex justify-center items-center gap-3 mb-12 flex-wrap">
          {["all", "upcoming", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                filter === tab
                  ? "bg-primary text-slate-950 border-primary shadow-[0_0_15px_rgba(0,243,255,0.25)]"
                  : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab} Events
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <BorderGlowCard
                key={idx}
                containerClassName="p-0 overflow-hidden h-[450px]"
                className="flex flex-col h-full animate-pulse"
                glowColor="rgba(0, 243, 255, 0.05)"
              >
                <div className="h-56 w-full bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40" />
                <div className="p-6 sm:p-8 flex flex-col flex-1 gap-4">
                  <div className="h-3.5 w-24 bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md" />
                  <div className="h-6 w-48 bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md" />
                  <div className="h-3.5 w-full bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md" />
                  <div className="h-3.5 w-5/6 bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md" />
                  <div className="h-10 w-full bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-xl mt-auto" />
                </div>
              </BorderGlowCard>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-1 md:col-span-2 text-center py-12 glass-panel border border-border/85 bg-card/25 rounded-3xl">
              <p className="text-sm font-extrabold text-foreground mb-1.5">No matching events found</p>
              <p className="text-xs text-muted-foreground">Adjust your filter category tab selection.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event) => (
                <motion.div
                  layout
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <BorderGlowCard
                    containerClassName="p-0 overflow-hidden h-full"
                    className="flex flex-col h-full"
                    glowColor="rgba(0, 243, 255, 0.12)"
                  >
                    {/* Event Cover Image */}
                     <div
                      className="h-56 w-full bg-cover bg-center bg-no-repeat relative shrink-0"
                      style={{ backgroundImage: `url(${optimizeCloudinaryUrl(resolveEventImage(event.bannerImage || event.image), "c_fill,w_800,h_450,q_auto,f_auto")})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      <span className={`absolute top-4 right-4 text-[10px] uppercase font-extrabold px-3 py-1.5 rounded-full ${
                        event.status === 'upcoming' 
                          ? 'bg-primary text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.35)]' 
                          : 'bg-muted border border-border/50 text-muted-foreground'
                      }`}>
                        {event.status}
                      </span>
                    </div>

                    {/* Event Contents */}
                    <div className="p-6 sm:p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary/80 mb-3 uppercase tracking-wider">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{event.category}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black mb-4 text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>

                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-6 flex-1 font-medium">
                        {event.desc}
                      </p>

                      <div className="flex flex-col gap-3 text-xs text-muted-foreground mb-8 border-t border-border/40 pt-4 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary/70 shrink-0" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-secondary/70 shrink-0" />
                          <span>{event.venue}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {event.status === "upcoming" ? (
                          <Button
                            onClick={() => handleRegisterClick(event)}
                            className="w-full justify-center gap-2 py-5 font-bold rounded-xl text-sm"
                            variant="glow"
                          >
                            <UserPlus className="w-4 h-4" />
                            Register Now
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedEvent(event);
                              setRegistrationOpen(true);
                            }}
                            className="w-full justify-center gap-2 py-5 font-bold rounded-xl border-border text-sm hover:bg-muted"
                          >
                            <Info className="w-4 h-4 text-primary" />
                            View Summary
                          </Button>
                        )}
                      </div>
                    </div>
                  </BorderGlowCard>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Registration Form / Summary Dialog */}
      <Dialog open={registrationOpen} onOpenChange={setRegistrationOpen}>
        <DialogContent className="max-w-md bg-card border border-border text-foreground rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-foreground flex items-center justify-between">
                  {selectedEvent.title}
                  <span className="text-[10px] uppercase font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    {selectedEvent.status}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs sm:text-sm mt-2 font-medium leading-relaxed">
                  {selectedEvent.desc}
                </DialogDescription>
              </DialogHeader>

              {/* Dynamic Registration Form Inputs (If upcoming) */}
              {selectedEvent.status === "upcoming" ? (
                <form onSubmit={handleRegistrationSubmit} className="mt-6 flex flex-col gap-5 border-t border-border/40 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Registration Form Details</h4>
                  
                  {(() => {
                    const formSchema = (selectedEvent.customFieldsSchema && selectedEvent.customFieldsSchema.length > 0)
                      ? selectedEvent.customFieldsSchema
                      : [
                          { fieldName: "Full Name", fieldType: "text", required: true },
                          { fieldName: "Enrollment Number", fieldType: "text", required: true },
                          { fieldName: "Branch", fieldType: "text", required: true },
                          { fieldName: "Year", fieldType: "select", required: true, options: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
                          { fieldName: "College Name", fieldType: "text", required: true },
                          { fieldName: "Phone Number", fieldType: "text", required: true }
                        ];
                    return formSchema.map((field: any) => (
                      <div key={field.fieldName} className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                          {field.fieldName} {field.required && "*"}
                        </label>
                        {field.fieldType === "select" ? (
                          <select
                            required={field.required}
                            value={formResponses[field.fieldName] || ""}
                            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                          >
                            <option value="">Select option</option>
                            {field.options?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            required={field.required}
                            type={field.fieldType === "number" ? "number" : "text"}
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                            value={formResponses[field.fieldName] || ""}
                            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            className="bg-background border-border/80 py-4.5 rounded-xl text-xs sm:text-sm"
                          />
                        )}
                      </div>
                    ));
                  })()}

                  {formError && (
                    <p className="text-xs text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-center gap-1.5">
                      {formError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4.5 font-bold rounded-xl mt-4 text-xs sm:text-sm justify-center"
                    variant="glow"
                  >
                    {processing ? "Confirming..." : "Confirm Registration"}
                  </Button>
                </form>
              ) : (
                /* Details / Summary (If completed) */
                <div className="mt-6 flex flex-col gap-4 border-t border-border/40 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Event Concluded</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                    This event has finished. Please check other active/upcoming campaigns hosted by ISTE MITS Gwalior!
                  </p>
                  
                  {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">Key Speakers</h5>
                      <div className="flex flex-col gap-3">
                        {selectedEvent.speakers.map((sp: any, sIdx: number) => (
                          <div key={sIdx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                            {sp.imageUrl && (
                              <img src={sp.imageUrl} alt={sp.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                            )}
                            <div>
                              <h6 className="font-bold text-xs text-foreground">{sp.name}</h6>
                              <span className="text-[10px] text-muted-foreground block">{sp.designation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => setRegistrationOpen(false)}
                    className="w-full py-4 rounded-xl mt-6 text-xs font-bold justify-center"
                    variant="outline"
                  >
                    Close Dialog
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
