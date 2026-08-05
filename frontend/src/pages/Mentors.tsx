import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Shield, Sparkles, Mail, Linkedin } from "lucide-react"
import { BorderGlowCard } from "@/components/ui/BorderGlowCard"
import { SplitText } from "@/components/animations/SplitText"
import { BlurText } from "@/components/animations/BlurText"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import manjreeImg from "@/assets/mentors/manjree-pandit.jpg"
import vishalImg from "@/assets/mentors/vishal-chaudhary.jpg"

export default function Mentors() {
  const [mentors, setMentors] = useState<any[]>([])

  const resolveMentorImage = (m: any) => {
    if (m.image && (m.image.startsWith("http://") || m.image.startsWith("https://") || m.image.startsWith("data:"))) {
      return m.image
    }
    const name = (m.name || "").toLowerCase()
    if (name.includes("manjree")) return manjreeImg
    if (name.includes("vishal")) return vishalImg
    return m.id === 1 ? manjreeImg : vishalImg
  }

  useEffect(() => {
    // Dynamic fetch from MongoDB Atlas via FastAPI
    const fetchMentors = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "/api"
        const res = await fetch(`${apiBase}/content/mentors`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            const mapped = data.map((m: any) => ({
              ...m,
              image: resolveMentorImage(m)
            }))
            setMentors(mapped)
          }
        }
      } catch (err) {
        console.warn("Could not retrieve dynamic mentors. Using client backup.", err)
      }
    }
    fetchMentors()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground relative pt-32 sm:pt-36 pb-16 px-4 sm:px-6 transition-colors duration-300">
      {/* Background Accent Glows */}
      <div className="absolute top-[20%] left-10 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Title */}
        <div className="text-center mb-16 select-none">
          <div className="mb-6 inline-block">
            <DecryptedText 
              text="OUR MENTORS" 
              className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
              speed={40} 
              delay={0.1} 
            />
          </div>
          <h1 className="flex flex-col items-center gap-1 sm:gap-2 tracking-tight leading-[1.05] mt-2">
            <SplitText 
              text="Our Venerable" 
              type="words" 
              className="text-[2.2rem] sm:text-[4rem] md:text-[5rem] font-light font-serif text-card-foreground dark:text-white" 
            />
            <SplitText 
              text="Leadership" 
              type="words" 
              className="font-serif italic font-normal text-[2.75rem] sm:text-[4.5rem] md:text-[5.5rem] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.1)] dark:drop-shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
            />
          </h1>
          <ScrollReveal delay={0.2} yOffset={15}>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
              Under their expert guidance and governance, ISTE MITS has grown into an incubator of technical talent, engineering logic, and student leadership.
            </p>
          </ScrollReveal>
        </div>

        {/* Mentor Rows */}
        <div className="flex flex-col gap-12">
          {mentors.map((mentor, index) => {
            const isEven = index % 2 === 0
            return (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <BorderGlowCard
                  containerClassName="p-0 overflow-hidden"
                  className={`flex flex-col md:flex-row gap-8 items-center p-8 md:p-12 ${
                    isEven ? "" : "md:flex-row-reverse"
                  }`}
                  glowColor={isEven ? "rgba(0, 243, 255, 0.15)" : "rgba(168, 85, 247, 0.15)"}
                >
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-[24px] shrink-0 border border-[rgba(255,255,255,0.45)] dark:border-border bg-white/55 dark:bg-card/45 p-2 shadow-[0_12px_40px_rgba(25,50,80,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative flex items-center justify-center">
                    <div className="w-full h-full rounded-[16px] overflow-hidden relative">
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="w-full h-full object-cover select-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Bio Container */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary tracking-wider mb-4 uppercase self-start">
                      {mentor.id === 1 ? <Shield className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {mentor.id === 1 ? "Executive Chairperson" : "Faculty Advisor"}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-foreground mb-1">{mentor.name}</h2>
                    <span className="text-xs sm:text-sm font-bold text-primary mb-6 block">
                      {mentor.designation}
                    </span>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-6 font-medium">
                      {mentor.longDescription || mentor.description}
                    </p>

                    {/* Social/Contact Actions */}
                    <div className="flex items-center gap-3">
                      <a
                        href={`mailto:${mentor.id === 1 ? "pvcoffice@mitsgwalior.in" : "proctor@mitsgwalior.in"}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/40 hover:bg-muted text-xs font-bold text-foreground transition-all duration-300 border border-border/40"
                      >
                        <Mail className="w-4 h-4 text-primary" />
                        Send Mail
                      </a>
                      <a
                        href="https://www.linkedin.com/school/madhav-institute-of-technology-&-science-gwalior/"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-foreground transition-all border border-border/40"
                      >
                        <Linkedin className="w-4 h-4 text-secondary" />
                      </a>
                    </div>
                  </div>
                </BorderGlowCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
