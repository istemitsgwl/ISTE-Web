import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Shield, Target, Compass, Award, Calendar, Zap, CheckCircle } from "lucide-react"
import { BorderGlowCard } from "@/components/ui/BorderGlowCard"
import { SplitText } from "@/components/animations/SplitText"
import { BlurText } from "@/components/animations/BlurText"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"

// Simple Animated Counter component
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = value
    if (start === end) return

    let totalMiliseconds = duration * 1000
    let incrementTime = Math.abs(Math.floor(totalMiliseconds / end))
    
    // Cap minimum increment time to avoid rendering lockups
    if (incrementTime < 16) incrementTime = 16

    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start >= end) clearInterval(timer)
    }, incrementTime)

    return () => clearInterval(timer)
  }, [isInView, value, duration])

  return <span ref={ref}>{count}</span>
}

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground relative pt-32 sm:pt-36 pb-16 px-4 sm:px-6 transition-colors duration-300">
      {/* Dynamic Background Mesh */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Title Section */}
        <div className="text-center mb-16 select-none">
          <div className="mb-6 inline-block">
            <DecryptedText 
              text="ABOUT US" 
              className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
              speed={40} 
              delay={0.1} 
            />
          </div>
          <h1 className="flex flex-col items-center gap-1 sm:gap-2 tracking-tight leading-[1.05] mt-2">
            <SplitText 
              text="Madhav Institute of" 
              type="words" 
              className="text-[2.2rem] sm:text-[4rem] md:text-[5rem] font-light font-serif text-card-foreground dark:text-white" 
            />
            <SplitText 
              text="Technical Education" 
              type="words" 
              className="font-serif italic font-normal text-[2.75rem] sm:text-[4.5rem] md:text-[5.5rem] bg-gradient-to-r from-primary to-[#6B5BFF] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.1)] dark:drop-shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
            />
          </h1>
          <ScrollReveal delay={0.2} yOffset={15}>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
              ISTE is a national professional non-profit organization dedicated to the development and quality improvement of technical education in India.
            </p>
          </ScrollReveal>
        </div>

        {/* Info Grid (Who, Mission, Vision) using BorderGlowCard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <BorderGlowCard glowColor="rgba(0, 243, 255, 0.15)">
            <div className="p-3 bg-secondary/10 rounded-xl mb-6 self-start">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-3 text-card-foreground dark:text-white">Who We Are</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              ISTE is a leading professional body committed to advancing technical education. It works closely with institutions, faculty members, and student chapters to foster excellence, engineering research, and standard educational models across India.
            </p>
          </BorderGlowCard>

          <BorderGlowCard glowColor="rgba(168, 85, 247, 0.15)">
            <div className="p-3 bg-secondary/10 rounded-xl mb-6 self-start">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-3 text-card-foreground dark:text-white">Our Mission</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              To provide high-quality training, encourage research and innovative product design, and foster seamless collaborations between academia and technology industries. We build systems that make students future-proof.
            </p>
          </BorderGlowCard>

          <BorderGlowCard glowColor="rgba(0, 243, 255, 0.15)">
            <div className="p-3 bg-secondary/10 rounded-xl mb-6 self-start">
              <Compass className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-3 text-card-foreground dark:text-white">Our Vision</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              To build a progressive professional environment that empowers educators and students alike, laying down foundational structures that contribute to national developments in engineering and industrial output.
            </p>
          </BorderGlowCard>
        </div>

        {/* Statistics Banner */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { value: 1200, label: "Active Members", suffix: "+" },
            { value: 50, label: "Seminars & Fests", suffix: "+" },
            { value: 15, label: "Regional Awards", suffix: "+" },
            { value: 100, label: "Practical Learning", suffix: "%" },
          ].map((stat, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl text-center border-border/50 relative overflow-hidden bg-card/25 backdrop-blur-md">
              <span className="text-3xl sm:text-4xl font-light font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                <AnimatedCounter value={stat.value} />
                {stat.suffix}
              </span>
              <p className="text-muted-foreground text-xs mt-2 uppercase font-bold tracking-wider font-sans">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Chapter description */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-panel p-8 md:p-12 rounded-3xl border border-primary/20 relative overflow-hidden bg-card/30 backdrop-blur-lg"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <span className="text-xs font-extrabold text-secondary uppercase tracking-wider">Our Chapter</span>
          <h2 className="text-2xl md:text-3xl font-black mt-2 mb-6 text-foreground">ISTE MITS Gwalior Student Chapter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-muted-foreground text-sm leading-relaxed font-medium">
            <div>
              <p className="mb-4">
                The ISTE MITS Gwalior Chapter is one of the most active societies within Madhav Institute of Technology & Science, Gwalior. We act as a catalyst for professional growth and innovation.
              </p>
              <p>
                By organizing technical fests, hands-on workshops, mock placement drives, and coding events, we empower students to apply concepts beyond the classroom and prepare for rigorous roles in the IT and engineering industries.
              </p>
            </div>
            <div>
              <p className="mb-4">
                Our collaborative framework enables peer-to-peer mentoring, technical reviews, and team building, helping members sharpen both their technological capacity and soft leadership skills.
              </p>
              <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground text-xs">Award-Winning Society</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Recognized for organizing benchmark events across regional networks.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
