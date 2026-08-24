import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Settings, Zap, GraduationCap, Sparkles } from "lucide-react"
import ThreeCanvas from "@/components/ThreeCanvas"
import CircularGallery from "@/components/CircularGallery"
import { BorderGlowCard } from "@/components/ui/BorderGlowCard"
import { Button } from "@/components/ui/Button"
import { SplitText } from "@/components/animations/SplitText"
import { BlurText } from "@/components/animations/BlurText"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { openMembershipPopup } from "@/components/MembershipPopup"
import { sortEventsDescending } from "@/utils/eventSorter"
import { resolveEventImage, optimizeCloudinaryUrl } from "@/utils/imageResolver"
import event1 from "@/assets/Events/e-summit-iste.jpg"
import event2 from "@/assets/Events/enigma-2025.webp"
import event3 from "@/assets/Events/xcalibire-23.webp"

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [heroItems, setHeroItems] = useState<Array<{ image: string; text: string }>>([
    { image: event1, text: "E-Summit" },
    { image: event2, text: "Enigma 2025" },
    { image: event3, text: "Xcalibur 23" },
    { image: event1, text: "ISTE Induction" },
    { image: event2, text: "Innovate MITS" },
    { image: event3, text: "Chapter Meet" },
    { image: event1, text: "Code Drive" },
    { image: event2, text: "Hackathon" }
  ])
  const [homeEvents, setHomeEvents] = useState<any[]>([])
  const [homeMentors, setHomeMentors] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      const apiBase = import.meta.env.VITE_API_URL || "/api"
      setLoadingEvents(true)
      
      // Fetch events
      try {
        const res = await fetch(`${apiBase}/events`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setHomeEvents(sortEventsDescending(data).slice(0, 3))
          }
        }
      } catch (err) {
        console.warn("REST events fetch failed for Home page:", err)
      } finally {
        setLoadingEvents(false)
      }

      // Fetch mentors
      try {
        const res = await fetch(`${apiBase}/content/mentors`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setHomeMentors(data)
          }
        }
      } catch (err) {
        console.warn("REST mentors fetch failed for Home page:", err)
      }
    }
    fetchHomeData()
  }, [])

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/content/gallery`)
        if (res.ok) {
          const allItems = await res.json()
          if (allItems && allItems.length > 0) {
            // Shuffle images randomly on each load
            const shuffled = [...allItems].sort(() => Math.random() - 0.5)
            
            const mapped = shuffled.map((item: any) => ({
              image: optimizeCloudinaryUrl(item.image, "c_fill,w_600,h_400,q_auto,f_auto"),
              text: item.title || "ISTE Showcase"
            }))
            
            // Loop items if we have fewer than target (8) for a complete circle
            const targetCount = 8
            let finalItems = [...mapped]
            if (finalItems.length < targetCount && finalItems.length > 0) {
              while (finalItems.length < targetCount) {
                finalItems = finalItems.concat(mapped)
              }
            }
            
            setHeroItems(finalItems)
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic hero images.", err)
      }
    }
    fetchHeroImages()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-hidden relative transition-colors duration-300">
      {/* 3D WebGL Background Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-45 dark:opacity-100">
        <ThreeCanvas />
      </div>

      {/* Dynamic Theme-aware Accent Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-glow-1 rounded-full blur-[120px] pointer-events-none radial-glow" />
      <div className="absolute top-[30%] right-1/4 w-[600px] h-[600px] bg-glow-2 rounded-full blur-[140px] pointer-events-none radial-glow" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-glow-1/50 rounded-full blur-[100px] pointer-events-none radial-glow" />

      {/* Grid Pattern overlay (Extends from Hero through Our Foundation section) */}
      <div className="absolute top-0 inset-x-0 h-[1700px] sm:h-[1950px] md:h-[2100px] grid-overlay pointer-events-none opacity-60 z-0" />

      {/* HERO SECTION WRAPPER */}
      <div className="relative w-full z-20">
        {/* VERTICAL LEFT SIDE TRIGGER — "MEMBERSHIP IS LIVE NOW" (ABSOLUTE TO HERO SECTION ONLY) */}
        <button
          onClick={openMembershipPopup}
          aria-label="Reopen Membership Announcement Popup"
          className="hidden lg:flex absolute -left-18 xl:-left-16 top-[76%] -translate-y-1/2 z-30 items-center gap-3 px-4 py-2 rounded-full bg-[#080b1a]/90 dark:bg-[#080b1a]/95 [.light_&]:bg-white/95 border border-primary/40 hover:border-primary text-xs font-extrabold text-white [.light_&]:text-slate-900 shadow-[0_0_20px_rgba(207,159,255,0.25)] hover:shadow-[0_0_35px_rgba(207,159,255,0.5)] hover:scale-105 transition-all duration-300 backdrop-blur-md group cursor-pointer select-none -rotate-90 origin-center whitespace-nowrap"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="tracking-[0.2em] uppercase font-mono text-[10.5px] font-bold text-[#CF9FFF] dark:text-[#CF9FFF] [.light_&]:text-[#7C3AED]">
            Membership is Live Now
          </span>
          <Sparkles className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform duration-300" />
        </button>

        {/* HERO SECTION CONTENT */}
        <section className="relative pt-28 sm:pt-32 md:pt-36 pb-2 px-4 sm:px-6 container mx-auto text-center max-w-5xl z-20">
          {/* MOBILE / TABLET VIEW: COMPACT HORIZONTAL TRIGGER PILL */}
          <div className="lg:hidden flex justify-center mb-4 z-30">
            <button
              onClick={openMembershipPopup}
              aria-label="Reopen Membership Announcement Popup"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 dark:bg-[#090d24]/90 [.light_&]:bg-white/90 border border-primary/40 text-xs font-extrabold text-white [.light_&]:text-slate-900 shadow-md backdrop-blur-md hover:scale-105 transition-all"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="tracking-wide text-[11px]">Membership is Live Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>

          {/* TOP SUB-HEADER BADGE */}
          <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/20 bg-secondary/10 backdrop-blur-md text-xs font-extrabold text-secondary tracking-wider uppercase select-none">
            <Zap className="w-3.5 h-3.5 text-secondary" />
            <DecryptedText text="EMPOWERING FUTURE ENGINEERS" speed={50} delay={0.2} />
          </div>

          <h1 className="flex flex-col items-center gap-1 sm:gap-2 tracking-tight leading-[1.05] mb-6 sm:mb-8 select-none">
            <SplitText 
              text="Indian Society for" 
              type="words" 
              className="text-[2.2rem] sm:text-[4rem] md:text-[5rem] font-light font-serif text-card-foreground dark:text-[#F6F3EC]" 
            />
            <SplitText 
              text="Technical Education" 
              type="words" 
              className="font-serif italic font-normal text-[2.75rem] sm:text-[4.8rem] md:text-[6.2rem] bg-gradient-to-r from-[#CF9FFF] to-[#F6F3EC] dark:from-[#CF9FFF] dark:to-[#F6F3EC] [.light_&]:from-[#7F00FF] [.light_&]:to-[#111827] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(207,159,255,0.2)] [.light_&]:drop-shadow-[0_0_15px_rgba(127,0,255,0.15)]" 
            />
          </h1>

          <ScrollReveal delay={0.3} yOffset={15}>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium">
              ISTE is a national professional organization fostering technical education,
              innovation, and leadership among students and educators.
            </p>
          </ScrollReveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2 relative z-30 pointer-events-auto"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full font-bold shadow-md hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group text-sm cursor-pointer"
            >
              <Link to="/about">
                Explore More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full font-bold shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Link to="/events">
                Our Events
              </Link>
            </Button>
          </motion.div>
        </section>
      </div>

      {/* WEBGL CIRCULAR GALLERY SHOWCASE */}
      <section className="relative w-full z-10 -mt-12 sm:-mt-16 mb-8">
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
          {heroItems.length > 0 && (
            <CircularGallery
              items={heroItems}
              bend={3}
              textColor="var(--color-primary)"
              borderRadius={0.03}
              scrollEase={0.03}
            />
          )}
        </div>
      </section>

      {/* VISION CARDS */}
      <section className="py-16 md:py-24 px-4 sm:px-6 container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16 select-none">
          <div className="mb-6 inline-block">
            <DecryptedText 
              text="OUR FOUNDATION" 
              className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
              speed={40} 
              delay={0.1} 
            />
          </div>
          <h2 className="mt-4">
            <BlurText 
              text="Learn. Create. Lead." 
              className="text-4xl md:text-5xl lg:text-6xl font-light font-serif text-card-foreground dark:text-white tracking-tight" 
            />
          </h2>
          <ScrollReveal delay={0.2} yOffset={15}>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
              Join a nationwide network of students and educators dedicated to achieving excellence in engineering.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BorderGlowCard glowColor="rgba(0, 243, 255, 0.15)">
            <div className="p-3 bg-primary/10 rounded-xl mb-6 self-start">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-3 text-card-foreground dark:text-white">Empowering Educators</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Providing resources, high-quality development programs, and collaborative platforms to enhance engineering instruction.
            </p>
          </BorderGlowCard>

          <BorderGlowCard glowColor="rgba(168, 85, 247, 0.15)">
            <div className="p-3 bg-primary/10 rounded-xl mb-6 self-start">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-3 text-card-foreground dark:text-white">Transforming Learning</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Introducing cutting-edge technical workshops, competitive programming, and engineering bootcamps to elevate technical competence.
            </p>
          </BorderGlowCard>

          <BorderGlowCard glowColor="rgba(0, 243, 255, 0.15)">
            <div className="p-3 bg-primary/10 rounded-xl mb-6 self-start">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-3 text-card-foreground dark:text-white">Inspiring Futures</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Nurturing a network of innovators, system architects, and designers to lead national progress and solve grand challenges.
            </p>
          </BorderGlowCard>
        </div>
      </section>

      {/* MENTORS SECTION */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-card/10 relative z-10 border-y border-border/40">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 select-none">
            <div className="mb-6 inline-block">
              <DecryptedText 
                text="GUIDANCE & LEADERSHIP" 
                className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
                speed={40} 
                delay={0.1} 
              />
            </div>
            <h2 className="mt-4">
              <BlurText 
                text="Message from Our Mentors" 
                className="text-4xl md:text-5xl lg:text-6xl font-light font-serif text-card-foreground dark:text-white tracking-tight" 
              />
            </h2>
            <ScrollReveal delay={0.2} yOffset={15}>
              <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
                Our faculty members lay down a strong pedagogical foundation, encouraging technical excellence and administrative rigor.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {homeMentors.map((mentor) => (
              <BorderGlowCard
                key={mentor.id}
                containerClassName="p-0 overflow-hidden"
                className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 items-center sm:items-start text-center sm:text-left animate-on-scroll"
                glowColor="rgba(0, 243, 255, 0.12)"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] border border-[rgba(255,255,255,0.45)] dark:border-border/60 bg-white/55 dark:bg-card/45 p-1.5 shadow-[0_8px_30px_rgba(25,50,80,0.06)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.1)] relative flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[14px] overflow-hidden relative">
                    <img
                      src={mentor.image || mentor.imageUrl}
                      alt={mentor.name}
                      className="w-full h-full object-cover select-none"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm italic text-muted-foreground mb-4 leading-relaxed font-medium font-serif">
                    "{(mentor.description || "").replace(/\n/g, ' ')}"
                  </p>
                  <h4 className="text-base sm:text-lg font-extrabold text-foreground font-sans tracking-tight">{mentor.name}</h4>
                  <span className="text-xs font-bold text-primary block mt-0.5 font-sans tracking-wide">{mentor.designation}</span>
                </div>
              </BorderGlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS PREVIEW */}
      <section className="py-16 md:py-24 px-4 sm:px-6 container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-16 select-none">
          <div className="mb-6 inline-block">
            <DecryptedText 
              text="WHAT'S HAPPENING" 
              className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
              speed={40} 
              delay={0.1} 
            />
          </div>
          <h2 className="mt-4">
            <BlurText 
              text="Recent & Upcoming Events" 
              className="text-4xl md:text-5xl lg:text-6xl font-light font-serif text-card-foreground dark:text-white tracking-tight" 
            />
          </h2>
          <ScrollReveal delay={0.2} yOffset={15}>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
              Explore workshops, hackathons, and mock placement preparation events hosted by ISTE MITS Gwalior.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {loadingEvents ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="glass-panel p-0 overflow-hidden flex flex-col h-full border border-border/40 bg-card/25 animate-pulse rounded-[24px]">
                <div className="h-44 w-full bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40" />
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="h-3 w-20 bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md" />
                  <div className="h-5 w-44 bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md" />
                  <div className="h-3 w-full bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md" />
                  <div className="h-3 w-5/6 bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md" />
                  <div className="h-4 w-24 bg-slate-900/50 dark:bg-slate-900/50 [.light_&]:bg-slate-300/40 rounded-md mt-4" />
                </div>
              </div>
            ))
          ) : homeEvents.length === 0 ? (
            <div className="col-span-1 md:col-span-3 text-center py-12 glass-panel border border-border/80 bg-card/20 rounded-[24px]">
              <p className="text-sm font-bold text-foreground mb-1">No Upcoming Events Scheduled</p>
              <p className="text-xs text-muted-foreground">Check back later for official announcements and workshops!</p>
            </div>
          ) : (
            homeEvents.map((event) => (
              <BorderGlowCard
                key={event.id}
                containerClassName="p-0 overflow-hidden"
                className="flex flex-col h-full animate-on-scroll"
                glowColor="rgba(168, 85, 247, 0.12)"
              >
                <div
                  className="h-44 w-full bg-cover bg-center bg-no-repeat relative"
                  style={{ backgroundImage: `url(${optimizeCloudinaryUrl(resolveEventImage(event.bannerImage || event.image), "c_fill,w_400,h_250,q_auto,f_auto")})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <span className={`absolute top-4 right-4 text-[9px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                    event.status === 'upcoming' 
                      ? 'bg-primary text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.35)]' 
                      : 'bg-muted text-muted-foreground border border-border/40'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[10px] text-primary font-extrabold uppercase tracking-widest mb-2 block">{event.date}</span>
                  <h3 className="text-base font-extrabold text-foreground mb-2 line-clamp-1 font-serif">{event.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-6 flex-1 line-clamp-3 font-medium">
                    {event.desc}
                  </p>
                  <Link
                    to={`/events`}
                    className="text-xs font-bold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 self-start"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </BorderGlowCard>
            ))
          )}
        </div>

        <div className="text-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-cyan-300 transition-colors group"
          >
            View All Flagship Events
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  )
}
