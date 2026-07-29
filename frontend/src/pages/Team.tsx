import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Linkedin, Mail, Users, Loader2 } from "lucide-react"
import { GlareHover } from "@/components/ui/GlareHover"
import { SplitText } from "@/components/animations/SplitText"
import { BlurText } from "@/components/animations/BlurText"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import fallbackImage from "@/assets/gallery/iste.jpg"

export default function Team() {
  const [committees, setCommittees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true)
      try {
        const snap = await getDocs(collection(db, "team"))
        const allMembers: any[] = []
        snap.forEach((doc) => {
          allMembers.push({ id: doc.id, ...doc.data() })
        })

        const uniqueMap = new Map<string, any>()

        if (allMembers.length > 0) {
          allMembers.forEach((m) => {
            const nameKey = (m.name || "").toLowerCase().trim()
            if (nameKey && !uniqueMap.has(nameKey)) {
              uniqueMap.set(nameKey, m)
            }
          })

          const uniqueMembers = Array.from(uniqueMap.values())

          const COMMITTEE_ORDER = [
            "Accounts Committee",
            "Technical Committee",
            "Public Relation Committee",
            "Marketing Committee",
            "Graphics Committee",
            "Management Committee",
            "Logistics Committee",
            "Content Committee"
          ]

          const fetchedCommittees = Array.from(new Set(uniqueMembers.map(m => m.committee || "General Committee")))
          const allCommitteeTitles = [
            ...COMMITTEE_ORDER,
            ...fetchedCommittees.filter(c => c && !COMMITTEE_ORDER.includes(c))
          ]

          const grouped = allCommitteeTitles.map(title => {
            const members = uniqueMembers.filter(m => m.committee === title)
            return { title, members }
          }).filter(c => c.members.length > 0)

          setCommittees(grouped)
        } else {
          setCommittees([])
        }
      } catch (err) {
        console.warn("Could not retrieve dynamic team members from Firestore:", err)
        setCommittees([])
      } finally {
        setLoading(false)
      }
    }
    fetchTeam()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground relative pt-32 sm:pt-36 pb-16 px-4 sm:px-6 transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-[30%] right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-0 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16 select-none">
          <div className="mb-6 inline-block">
            <DecryptedText 
              text="STEERING TEAM" 
              className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
              speed={40} 
              delay={0.1} 
            />
          </div>
          <h1 className="flex flex-col items-center gap-1 sm:gap-2 tracking-tight leading-[1.05] mt-2">
            <SplitText 
              text="The Steering" 
              type="words" 
              className="text-[2.2rem] sm:text-[4rem] md:text-[5rem] font-light font-serif text-card-foreground dark:text-white" 
            />
            <SplitText 
              text="Committees" 
              type="words" 
              className="font-serif italic font-normal text-[2.75rem] sm:text-[4.5rem] md:text-[5.5rem] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.1)] dark:drop-shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
            />
          </h1>
          <ScrollReveal delay={0.2} yOffset={15}>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
              Meet the student architects behind ISTE MITS Gwalior. From code compilation to budget orchestration, these committees power our operations.
            </p>
          </ScrollReveal>
        </div>

        {/* Committees Layout */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full sm:w-[260px] md:w-[265px] p-6 bg-card/20 border border-border/10 rounded-[24px] animate-pulse flex flex-col items-center"
              >
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 mb-4" />
                <div className="h-4 w-32 bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md mb-2" />
                <div className="h-3 w-24 bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md" />
              </div>
            ))}
          </div>
        ) : committees.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl p-12 text-center border border-border/80 bg-card/40 dark:bg-card/20 max-w-xl mx-auto flex flex-col items-center my-8 shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Team Directory Empty</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              No steering committee members have been registered in the database yet. Check back soon for official updates!
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-16">
            {committees.map((committee) => (
              <div key={committee.title} className="flex flex-col">
                {/* Committee Title */}
                <div className="flex items-center gap-4 mb-8 select-none">
                  <h2 className="text-xl sm:text-2xl font-light font-serif text-foreground tracking-tight whitespace-nowrap">{committee.title}</h2>
                  <div className="h-[1px] w-full bg-border/80" />
                </div>

                {/* Members Grid */}
                <div className="flex flex-wrap justify-center gap-6">
                  {committee.members.map((member: any, mIndex: number) => (
                    <motion.div
                      key={member.id || member.name}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: mIndex * 0.05 }}
                      className="w-full sm:w-[260px] md:w-[265px] h-full flex-shrink-0"
                    >
                      <GlareHover
                        glareColor="#CF9FFF"
                        glareOpacity={0.22}
                        glareAngle={-35}
                        glareSize={280}
                        transitionDuration={900}
                        playOnce={false}
                        className="h-full bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-border/60"
                      >
                        <div className="flex flex-col items-center text-center p-6 h-full">
                          {/* Avatar */}
                          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full shrink-0 border border-[rgba(255,255,255,0.45)] dark:border-border/60 bg-white/55 dark:bg-card/45 p-1.5 shadow-[0_8px_30px_rgba(25,50,80,0.06)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.1)] relative flex items-center justify-center mb-4">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                              <img
                                src={member.img || fallbackImage}
                                alt={member.name}
                                onError={(e) => {
                                  e.currentTarget.src = fallbackImage
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                              />
                            </div>
                          </div>

                          <h4 className="font-extrabold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">
                            {member.name}
                          </h4>
                          
                          <span className="text-[10px] sm:text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-2 mb-6 block">
                            {member.role}
                          </span>

                          {/* Social Handles */}
                          <div className="flex items-center gap-3 mt-auto pt-2">
                            {member.linkedin && (
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-muted/40 hover:bg-muted border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300"
                                aria-label="LinkedIn"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="p-2 rounded-xl bg-muted/40 hover:bg-muted border border-border/40 text-muted-foreground hover:text-secondary hover:border-secondary/40 transition-all duration-300"
                                aria-label="Email"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </GlareHover>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
