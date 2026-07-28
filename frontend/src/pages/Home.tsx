import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { mentors, events } from "@/data/siteData"
import { ArrowRight, BookOpen, Settings, Zap, GraduationCap, Sparkles } from "lucide-react"
import ThreeCanvas from "@/components/ThreeCanvas"
import CircularGallery from "@/components/CircularGallery"
import { BorderGlowCard } from "@/components/ui/BorderGlowCard"
import { Button } from "@/components/ui/Button"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { SplitText } from "@/components/animations/SplitText"
import { BlurText } from "@/components/animations/BlurText"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { sortEventsDescending } from "@/utils/eventSorter"

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [heroItems, setHeroItems] = useState<Array<{ image: string; text: string }>>([])
  const [homeEvents, setHomeEvents] = useState<any[]>(sortEventsDescending(events).slice(0, 3))

  useEffect(() => {
    const fetchHomeEvents = async () => {
      try {
        const snap = await getDocs(collection(db, "events"))
        const data: any[] = []
        snap.forEach((doc) => {
          const item = doc.data()
          if (item) {
            data.push({ id: doc.id, ...item })
          }
        })
        if (data.length > 0) {
          const sorted = sortEventsDescending(data)
          setHomeEvents(sorted.slice(0, 3))
        }
      } catch (err) {
        console.warn("Home events fetch failed, using fallback.", err)
      }
    }
    fetchHomeEvents()
  }, [])

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const snap = await getDocs(collection(db, "gallery"))
        const allItems: any[] = []
        snap.forEach((doc) => {
          const item = doc.data()
          if (item && item.image) {
            allItems.push({ id: doc.id, ...item })
          }
        })

        // Separate items by Hero Gallery and others
        const heroFiltered = allItems.filter(
          item => item.category?.toLowerCase() === "hero gallery"
        )

        // Deduplicate and combine
        const combined: any[] = []
        const addIfUnique = (item: any) => {
          if (!combined.some(existing => existing.image === item.image || existing.id === item.id)) {
            combined.push(item)
          }
        }

        heroFiltered.forEach(addIfUnique)
        allItems.forEach(addIfUnique)

        // Fisher-Yates shuffle algorithm for dynamic random photo showcase
        const shuffled = [...combined]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        const selected = shuffled.slice(0, 10)
        setHeroItems(selected.map(item => ({ image: item.image, text: item.title })))
      } catch (err) {
        console.warn("Failed to fetch dynamic hero images.", err)
        setHeroItems([])
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

      {/* HERO SECTION */}
      <section className="relative pt-28 sm:pt-32 md:pt-36 pb-2 px-4 sm:px-6 container mx-auto text-center max-w-5xl z-20">
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

      {/* WEBGL CIRCULAR GALLERY SHOWCASE */}
      <section className="relative w-full z-10 -mt-12 sm:-mt-16 mb-8">
        <div className="relative w-full h-[400px] md:h-[500px]">
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
            {mentors.map((mentor) => (
              <BorderGlowCard
                key={mentor.id}
                containerClassName="p-0 overflow-hidden"
                className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 items-center sm:items-start text-center sm:text-left animate-on-scroll"
                glowColor="rgba(0, 243, 255, 0.12)"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] border border-[rgba(255,255,255,0.45)] dark:border-border/60 bg-white/55 dark:bg-card/45 p-1.5 shadow-[0_8px_30px_rgba(25,50,80,0.06)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.1)] relative flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[14px] overflow-hidden relative">
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="w-full h-full object-cover select-none"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm italic text-muted-foreground mb-4 leading-relaxed font-medium font-serif">
                    "{mentor.description.replace(/\n/g, ' ')}"
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
          {homeEvents.map((event) => (
            <BorderGlowCard
              key={event.id}
              containerClassName="p-0 overflow-hidden"
              className="flex flex-col h-full animate-on-scroll"
              glowColor="rgba(168, 85, 247, 0.12)"
            >
              <div
                className="h-44 w-full bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: `url(${event.bannerImage || event.image})` }}
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
          ))}
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
