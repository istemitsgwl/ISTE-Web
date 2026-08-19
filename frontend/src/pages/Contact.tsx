import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Phone, MapPin, Send, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { BorderGlowCard } from "@/components/ui/BorderGlowCard"
import { SplitText } from "@/components/animations/SplitText"
import { BlurText } from "@/components/animations/BlurText"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  })

  const validateForm = () => {
    if (formData.name.trim().length < 2) return "Please enter your full name (at least 2 characters)."
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) return "Please enter a valid email address."
    if (formData.subject.trim().length < 3) return "Please enter a subject (at least 3 characters)."
    if (formData.message.trim().length < 5) return "Please write a message (at least 5 characters)."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return

    const validationError = validateForm()
    if (validationError) {
      setFeedback({ type: "error", text: validationError })
      return
    }

    setSending(true)
    setFeedback({ type: null, text: "" })

    const apiBase = import.meta.env.VITE_API_URL || "/api"

    try {
      const res = await fetch(`${apiBase}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.status === 201 || res.ok) {
        setFeedback({
          type: "success",
          text: data.message || "Your message has been sent successfully! Our team will get back to you shortly.",
        })
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else if (res.status === 429) {
        setFeedback({
          type: "error",
          text: data.detail || "Too many message submissions. Please wait 1 minute before trying again.",
        })
      } else {
        setFeedback({
          type: "error",
          text: data.detail || "Failed to send message. Please check your network connection and try again.",
        })
      }
    } catch (err) {
      console.error("Contact submit error:", err)
      setFeedback({
        type: "error",
        text: "Network error occurred while submitting. Please try again.",
      })
    } finally {
      setSending(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative pt-32 sm:pt-36 pb-16 px-4 sm:px-6 transition-colors duration-300">
      {/* Background Accent Glows */}
      <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-0 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Title Block */}
        <div className="text-center mb-16 select-none">
          <div className="mb-6 inline-block">
            <DecryptedText 
              text="CONTACT US" 
              className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
              speed={40} 
              delay={0.1} 
            />
          </div>
          <h1 className="flex flex-col items-center gap-1 sm:gap-2 tracking-tight leading-[1.05] mt-2">
            <SplitText 
              text="Get In" 
              type="words" 
              className="text-[2.2rem] sm:text-[4rem] md:text-[5rem] font-light font-serif text-card-foreground dark:text-white" 
            />
            <SplitText 
              text="Touch & Connect" 
              type="words" 
              className="font-serif italic font-normal text-[2.75rem] sm:text-[4.5rem] md:text-[5.5rem] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.1)] dark:drop-shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
            />
          </h1>
          <ScrollReveal delay={0.2} yOffset={15}>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
              Have a question, feedback, or sponsorship proposal? Reach out to our organizing team directly.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Email Info Card */}
          <BorderGlowCard glowColor="rgba(0, 243, 255, 0.15)" containerClassName="flex-1" className="items-center text-center">
            <div className="p-3 bg-secondary/10 rounded-xl mb-6">
              <Mail className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Email Us</h3>
            <p className="text-xs text-muted-foreground font-medium">For support or queries</p>
            <a href="mailto:iste.mits.gwl@gmail.com" className="text-primary hover:underline text-xs sm:text-sm font-extrabold mt-6">
              iste.mits.gwl@gmail.com
            </a>
          </BorderGlowCard>

          {/* Phone Info Card */}
          <BorderGlowCard glowColor="rgba(168, 85, 247, 0.15)" containerClassName="flex-1 border-secondary/30" className="items-center text-center">
            <div className="p-3 bg-secondary/10 rounded-xl mb-6">
              <Phone className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Call Contacts</h3>
            <p className="text-xs text-muted-foreground font-medium">Faculty Coordinator, ISTE MITS</p>
            <div className="text-xs sm:text-sm text-muted-foreground mt-6 flex flex-col gap-1 items-center">
              <span className="text-foreground font-extrabold text-xs sm:text-sm">Prof. Vishal Chaudhary</span>
              <a href="tel:9926245805" className="text-primary hover:underline text-xs sm:text-sm font-black">
                +91 9926245805
              </a>
            </div>
          </BorderGlowCard>

          {/* Address Info Card */}
          <BorderGlowCard glowColor="rgba(0, 243, 255, 0.15)" containerClassName="flex-1" className="items-center text-center">
            <div className="p-3 bg-secondary/10 rounded-xl mb-6">
              <MapPin className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Our Campus</h3>
            <p className="text-xs text-muted-foreground font-medium">Office location address</p>
            <p className="text-foreground text-xs sm:text-sm font-extrabold mt-6 leading-relaxed">
              MITS Gwalior, <br />Madhya Pradesh, India
            </p>
          </BorderGlowCard>
        </div>

        {/* Contact Form & Map Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-8">
          {/* Map Container */}
          <BorderGlowCard glowColor="rgba(168, 85, 247, 0.12)" containerClassName="p-0 overflow-hidden min-h-[350px]">
            <iframe
              src="https://maps.google.com/maps?q=Madhav%20Institute%20of%20Technology%20and%20Science%20Gwalior&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(0.3)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="MITS Gwalior Campus Map Location"
              className="w-full h-full min-h-[350px]"
            />
          </BorderGlowCard>

          {/* Form Container */}
          <BorderGlowCard glowColor="rgba(0, 243, 255, 0.12)" containerClassName="p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-black text-foreground mb-1">Send Us a Message</h2>
            <p className="text-[11px] text-muted-foreground mb-8 font-medium">
              Complete the form below, and we will route your submission to the respective committee heads.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <AnimatePresence>
                {feedback.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-3 border ${
                      feedback.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-destructive/10 border-destructive/30 text-destructive"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{feedback.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Your Name *</label>
                  <Input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    disabled={sending}
                    aria-label="Your Name"
                    className="bg-background border-border/80 py-5 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Your Email *</label>
                  <Input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    disabled={sending}
                    aria-label="Your Email"
                    className="bg-background border-border/80 py-5 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Subject *</label>
                <Input
                  required
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter subject"
                  disabled={sending}
                  aria-label="Subject"
                  className="bg-background border-border/80 py-5 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Message *</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  disabled={sending}
                  aria-label="Message"
                  rows={4}
                  className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60 transition-all outline-none resize-none disabled:opacity-60"
                />
              </div>

              <Button
                type="submit"
                disabled={sending}
                className="mt-2 py-5 text-xs sm:text-sm font-extrabold justify-center gap-2 rounded-xl"
                variant="glow"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </Button>
            </form>
          </BorderGlowCard>
        </div>
      </div>
    </div>
  )
}
