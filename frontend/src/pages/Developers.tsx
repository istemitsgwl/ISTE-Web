import React, { useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Code2, Terminal, Cpu, Sparkles, Github, Linkedin, Mail, ExternalLink,
  Award, GraduationCap, Briefcase, ChevronRight, Download, Layers,
  CheckCircle2, Star, Rocket, Shield, BookOpen, UserCheck, ArrowUpRight,
  Brain, Database, Cloud, Wrench, Heart, Users, Twitter
} from "lucide-react"

import shivamPortrait from "@/assets/shivam-patidar.jpg"
import shivamSharmaPortrait from "@/assets/shivam-sharma.jpg"
import amitVishwakarmaPortrait from "@/assets/amit-vishwakarma.jpg"
import ayanAhmedKhanPortrait from "@/assets/ayan-ahmed-khan.jpg"
import khushiGoyalPortrait from "@/assets/khushi-goyal.jpg"
import manjreePanditImg from "@/assets/mentors/manjree-pandit.jpg"
import vishalChaudharyImg from "@/assets/mentors/vishal-chaudhary.jpg"
import { Button } from "@/components/ui/Button"
import { BorderGlowCard } from "@/components/ui/BorderGlowCard"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { SplitText } from "@/components/animations/SplitText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"

// ----------------------------------------------------
// DYNAMIC DATA MODEL (Prepared for MongoDB Atlas integration)
// ----------------------------------------------------

interface DeveloperProfileData {
  id: string
  name: string
  role: string
  subtitle: string
  bio: string
  photo: string
  badges: string[]
  stats: { label: string; value: string; detail: string }[]
  links: { github: string; linkedin: string; email: string; portfolio?: string; resume?: string }
}

interface SupportingDevData {
  id: string
  photo: string
  name: string
  branchCollege: string
  roleTag: string
  shortAbout: string
  linkedin: string
  email: string
  portfolio?: string
}

interface FacultyMentorData {
  id: string
  name: string
  title: string
  department: string
  description: string
  office: string
  email: string
  photo: string
}

const PRIMARY_DEV: DeveloperProfileData = {
  id: "shivam-patidar",
  name: "Shivam Patidar",
  role: "Building the Future with Agentic AI , Applied AI & Machine Learning, Full Stack Developer ,Always Evolving",
  subtitle: "Building the Future with Agentic AI • Applied AI & Machine Learning • Full Stack Developer • Always Evolving",
  bio: "Passionate Computer Science & Design undergraduate focused on building intelligent autonomous systems using Agentic AI, Large Language Models, Retrieval-Augmented Generation (RAG), Deep Learning, and scalable cloud-native architectures. I enjoy transforming cutting-edge AI research into production-ready applications that solve real-world problems across education, healthcare, and agriculture.",
  photo: shivamPortrait,
  badges: [
    "B.Tech CSD • MITS Gwalior",
    "Agentic AI",
    "AI/ML",
    "Generative AI",
    "Large Language Models",
    "RAG Systems",
    "ISTE Technical Member"
  ],
  stats: [
    { label: "CGPA Score", value: "8.99", detail: "Out of 10.0 scale" },
    { label: "Branch Rank", value: "3rd", detail: "Computer Science & Design" },
    { label: "Dept Rank", value: "3rd", detail: "Dept of CSE" },
    { label: "Institute Rank", value: "#43", detail: "MITS Gwalior Overall" }
  ],
  links: {
    github: "https://github.com/ShivamPatidar03",
    linkedin: "https://www.linkedin.com/in/shivam-patidar-18646832a",
    email: "shivampatidar780@gmail.com",
    portfolio: "https://github.com/ShivamPatidar03",
    resume: "#"
  }
}

const SUPPORTING_DEVS: SupportingDevData[] = [
  {
    id: "amit-vishwakarma",
    photo: amitVishwakarmaPortrait,
    name: "Amit Vishwakarma",
    branchCollege: "Information Technology (IoT) • MITS Gwalior",
    roleTag: "Full Stack Developer",
    shortAbout: "I am a pre-final year Information Technology (IoT) undergraduate specializing in backend architecture, full-stack web development, and cloud-native solutions. My technical foundation rests heavily on Java, Spring Boot, RESTful API design, Docker, and AWS, complemented by active problem-solving and algorithmic optimization.",
    linkedin: "https://www.linkedin.com/in/amit-vishwakarma-7134a133a/",
    email: "amit2315vishwakarma@gmail.com"
  },
  {
    id: "shivam-sharma",
    photo: shivamSharmaPortrait,
    name: "Shivam Sharma",
    branchCollege: "Electronics & Communication Engineering • MITS Gwalior",
    roleTag: "Electronics Student • Data Analytics & Graphic Design",
    shortAbout: "Hi, I'm a 3rd-year ECE student at MITS Gwalior, currently learning Data Analytics and building my skills in Excel, SQL, Power BI, and Python. I'm also interested in Graphic Designing and want to grow my career in the Data Analytics field.",
    linkedin: "https://www.linkedin.com/in/shivam-sharma-ab22532a7",
    email: "hshivamsharma1122@gmail.com"
  }
]

// Technical Mentors & Leadership — featured in the dedicated "Mentored By / Technical Leadership" section
const WEB_MENTORS = [
  {
    id: "ayan-ahmed-khan",
    photo: ayanAhmedKhanPortrait,
    name: "Ayan Ahmed Khan",
    roleBadge: "Mentor & Tech Head",
    headline: "Mentor & Tech Head",
    subHeadline: "Applied AI Intern @ Dexter Capital • Deployment & Security Engineer",
    branchCollege: "Information Technology (IoT) • MITS Gwalior • Batch 2023–27",
    bio: "Information Technology (IoT) undergraduate at MITS Gwalior and Applied AI Intern at Dexter Capital, working on trustworthy machine learning, RAG and agentic AI systems, and backend engineering. Mentors the ISTE web team on modern web design and engineering practices, and architected the production deployment of this platform — Vercel multi-service infrastructure, API security hardening, and rate limiting.",
    expertise: [
      "Web Design & UI Engineering",
      "Vercel Multi-Service Deployment",
      "API Security & Rate Limiting",
      "Trustworthy ML Research",
      "RAG & Agentic AI Systems",
      "Backend Engineering"
    ],
    links: {
      portfolio: "https://ayanahmedkhan.vercel.app",
      github: "https://github.com/AyanAhmedKhan",
      linkedin: "https://www.linkedin.com/in/ayan-ahmed-khan-95978620a",
      email: "ayan.ahmedkhan591@gmail.com"
    }
  },
  {
    id: "khushi-goyal",
    photo: khushiGoyalPortrait,
    name: "Khushi Goyal",
    roleBadge: "Technical Head & Management Coordinator",
    headline: "Technical Head, ISTE-2026 · Management Coordinator, ISTE-2027",
    subHeadline: "AI Intern @ ResoluteCorp • Full-Stack & AI Developer",
    branchCollege: "Computer Science & Design (CSD) • 1st Runner-Up — Manthan Hackathon 1.0, MANIT Bhopal • MITS Gwalior • Batch 2023–27",
    stats: [
      { label: "CGPA", value: "8.89" },
      { label: "Branch & Dept Rank", value: "3rd" }
    ],
    bio: "Computer Science & Design undergraduate and AI intern passionate about building intelligent, scalable, and user-centric applications. Experienced in full-stack development, Generative AI, RAG, machine learning, prompt engineering, and cloud deployment. As Technical Head at ISTE, she leads website development, digital experience enhancements, technical initiatives, and management event coordination.",
    expertise: [
      "Full-Stack Development",
      "Generative AI & RAG",
      "AI / Machine Learning",
      "React & Node.js",
      "Python",
      "Cloud Deployment & SaaS"
    ],
    links: {
      github: "https://github.com/khushi1k4",
      linkedin: "https://www.linkedin.com/in/khushigoyal09142005/",
      twitter: "https://x.com/Khushi_1k4",
      email: "khushigoyal2525@gmail.com"
    }
  }
]

const FACULTY_MENTORS: FacultyMentorData[] = [
  {
    id: "dr-manjree-pandit",
    name: "Dr. Manjree Pandit",
    title: "Senior Advisor & Dean Academic",
    department: "Electrical Engineering / Administration, MITS Gwalior",
    description: "Providing strategic academic leadership, visionary direction, and institutional support for technological innovation at MITS Gwalior.",
    office: "Dean Office, Administrative Block",
    email: "deanacademic@mitsgwl.ac.in",
    photo: manjreePanditImg
  },
  {
    id: "prof-vishal-chaudhary",
    name: "Prof. Vishal Chaudhary",
    title: "Faculty Coordinator",
    department: "Computer Science & Engineering, MITS Gwalior",
    description: "Guiding student technical projects, society initiatives, hackathons, and fostering engineering excellence within ISTE Student Chapter MITS.",
    office: "CSE Department, MITS Gwalior",
    email: "vishal.chaudhary@mitsgwl.ac.in",
    photo: vishalChaudharyImg
  }
]

export default function Developers() {
  const shouldReduceMotion = useReducedMotion()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (window.innerWidth < 1024) return // Disable on touch and smaller devices

    let rafId: number
    let lastX = 0
    let lastY = 0
    let ticking = false

    const handleMouseMove = (e: MouseEvent) => {
      lastX = (e.clientX - window.innerWidth / 2) / 35
      lastY = (e.clientY - window.innerHeight / 2) / 35
      
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          setMousePosition({ x: lastX, y: lastY })
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground relative pt-28 sm:pt-32 pb-24 px-4 sm:px-8 md:px-12 overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      
      {/* Ambient Background Gradient Aura (Desktop Only for fast mobile GPU rendering) */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none z-0 hidden lg:dark:block" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[180px] pointer-events-none z-0 hidden lg:dark:block" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50 z-0" />

      <div className="w-full max-w-[1400px] mx-auto relative z-10 space-y-24 sm:space-y-32">
        
        {/* ==================================================== */}
        {/* SECTION 1 — HERO SECTION (CINEMATIC PERSONAL PROFILE) */}
        {/* ==================================================== */}
        <section className="min-h-[85vh] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 pt-4 relative">
          
          {/* LEFT 40%: CINEMATIC PORTRAIT */}
          <div className="w-full lg:w-[40%] flex justify-center order-first lg:order-none relative">
            {/* Ambient glows behind the portrait */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse hidden lg:dark:block" />
            <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none -z-10 hidden lg:dark:block" />
            
            {/* Mesh gradient effect behind the picture */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-transparent blur-2xl sm:blur-3xl pointer-events-none -z-10" />

            {/* Mouse Parallax Container for Portrait */}
            <motion.div
              style={{
                x: shouldReduceMotion ? 0 : mousePosition.x * 0.4,
                y: shouldReduceMotion ? 0 : mousePosition.y * 0.4,
              }}
              className="relative w-full max-w-[460px] aspect-[4/5] rounded-[32px] overflow-hidden bg-card/60 dark:bg-slate-950/20 backdrop-blur-md sm:backdrop-blur-3xl shadow-xl dark:shadow-[0_50px_100px_rgba(0,0,0,0.7)] border border-border dark:border-white/10 group"
            >
              {/* Glass reflection gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.04] pointer-events-none z-10" />
              
              <img
                src={PRIMARY_DEV.photo}
                alt={PRIMARY_DEV.name}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
              />
              
              {/* Soft Edge Fade Overlay at the bottom */}
              <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none z-20" />
            </motion.div>
          </div>

          {/* RIGHT 60%: TYPOGRAPHY, SKILL CHIPS & FLOATING METRICS */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.1
                }
              }
            }}
            className="w-full lg:w-[60%] flex flex-col gap-8 text-center lg:text-left items-center lg:items-start"
          >
            {/* Header Badge */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card dark:bg-white/[0.03] border border-border dark:border-white/[0.06] backdrop-blur-md text-[11px] font-extrabold uppercase tracking-widest text-primary shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Meet the Developer</span>
            </motion.div>

            {/* Giant Name & Professional Title */}
            <div className="flex flex-col gap-3">
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 25 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-foreground dark:text-white leading-none"
              >
                {PRIMARY_DEV.name}
              </motion.h1>
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                }}
                className="text-[#7C3AED] dark:text-[#CF9FFF] text-xs sm:text-sm md:text-base font-black uppercase tracking-wider"
              >
                Building the Future with Agentic AI &bull; Applied AI & Machine Learning &bull; Full Stack Developer &bull; Always Evolving
              </motion.p>
            </div>

            {/* Introduction Paragraph */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium max-w-2xl text-center lg:text-left"
            >
              {PRIMARY_DEV.bio}
            </motion.p>

            {/* Core Skill Chips (Staggered Animations) */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2 max-w-2xl"
            >
              {[
                "B.Tech CSD MITS Gwalior", "ISTE Technical Lead", "Agentic AI", 
                "AI/ML", "Gen AI", "RAG Systems", "AI Automation"
              ].map((skill, idx) => (
                <motion.span
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-card dark:bg-white/[0.03] border border-border dark:border-white/[0.06] backdrop-blur-md text-[11px] font-bold text-foreground hover:border-primary/50 dark:hover:border-[#CF9FFF]/30 transition-all shadow-sm cursor-default"
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>



            {/* Large Premium CTA Buttons with Magnetic/Hover Effects */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <a href={PRIMARY_DEV.links.github} target="_blank" rel="noreferrer">
                <Button
                  variant="outline"
                  className="group gap-2.5 rounded-xl text-xs font-extrabold px-6 py-3.5 border-border dark:border-white/[0.08] bg-card dark:bg-white/[0.02] hover:bg-accent text-foreground transition-all shadow-md"
                >
                  <Github className="w-4 h-4 text-primary" />
                  <span>GitHub Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </a>
              <a href={PRIMARY_DEV.links.linkedin} target="_blank" rel="noreferrer">
                <Button
                  variant="outline"
                  className="group gap-2.5 rounded-xl text-xs font-extrabold px-6 py-3.5 border-border dark:border-white/[0.08] bg-card dark:bg-white/[0.02] hover:bg-accent text-foreground transition-all shadow-md"
                >
                  <Linkedin className="w-4 h-4 text-primary" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </a>
              <a href={`mailto:${PRIMARY_DEV.links.email}`}>
                <Button
                  variant="outline"
                  className="group gap-2.5 rounded-xl text-xs font-extrabold px-6 py-3.5 border-border dark:border-white/[0.08] bg-card dark:bg-white/[0.02] hover:bg-accent text-foreground transition-all shadow-md"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Email</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ==================================================== */}
        {/* SECTION 3 — EDUCATION & ACHIEVEMENTS */}
        {/* ==================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: EDUCATION & ACADEMIC PERFORMANCE */}
          <ScrollReveal yOffset={30}>
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 flex flex-col justify-between gap-6 h-full">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-card-foreground dark:text-white">Education & Standing</h3>
                      <p className="text-xs text-muted-foreground font-semibold">Madhav Institute of Technology & Science (MITS), Gwalior</p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs">2024 – 2028</span>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  {/* Degree Summary Banner */}
                  <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-background/70 border border-border/60 shadow-sm">
                    <div>
                      <p className="font-extrabold text-foreground text-sm sm:text-base">Bachelor of Technology</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Computer Science & Design (CSD)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">CGPA</span>
                      <span className="text-xl font-black text-primary">8.99</span>
                    </div>
                  </div>

                  {/* Academic Performance Header & Grid */}
                  <div className="pt-1 flex flex-col gap-3">
                    <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">Academic Performance</h4>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-background/60 border border-border/50 flex flex-col items-center justify-center text-center gap-1 shadow-sm hover:border-primary/40 transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CGPA</span>
                        <p className="text-xl sm:text-2xl font-black text-primary">8.99</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-background/60 border border-border/50 flex flex-col items-center justify-center text-center gap-1 shadow-sm hover:border-primary/40 transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Branch Rank</span>
                        <p className="text-xl sm:text-2xl font-black text-primary">3</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-background/60 border border-border/50 flex flex-col items-center justify-center text-center gap-1 shadow-sm hover:border-primary/40 transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Institution Rank</span>
                        <p className="text-xl sm:text-2xl font-black text-primary">43</p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Chapter Membership */}
                  <div className="p-4 rounded-2xl bg-background/70 border border-border/60 flex items-center gap-3.5 shadow-sm">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-extrabold text-foreground text-xs leading-relaxed">
                      Technical Member — ISTE Students' Chapter MITS-DU
                    </span>
                  </div>

                  {/* Specializations Chips */}
                  <div className="pt-2 flex flex-col gap-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                      Core Academic Focus Areas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Data Structures & Algorithms", "Agentic AI & RAG", "System Design", "Database Systems", "Cloud Architecture"].map((spec) => (
                        <span key={spec} className="px-2.5 py-1 rounded-lg bg-background/50 border border-border/50 text-[10px] font-bold text-muted-foreground">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* RIGHT: KEY ACHIEVEMENTS & IMPACT */}
          <ScrollReveal yOffset={30} delay={0.1}>
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 flex flex-col gap-6 h-full">
              <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-card-foreground dark:text-white">Key Achievements & Impact</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Technical Milestones & Leadership</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-background/60 border border-border/50 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground text-sm">Lead Developer — ISTE MITS Digital Platform</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary">Production</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Architected and developed the official ISTE MITS website using React, FastAPI, MongoDB, TypeScript, GSAP, Three.js, and modern cloud-native engineering practices with a scalable CMS-driven architecture.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-background/60 border border-border/50 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground text-sm">AutoSci — Autonomous AI Scientist</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary">Research Engine</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Designed a multi-agent research platform that automates research paper analysis, knowledge graph generation, hypothesis discovery, and experiment planning using Agentic AI, RAG, and LLM-powered workflows.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-background/60 border border-border/50 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground text-sm">AI-Powered Smart Agriculture Platform</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary">Agriculture AI</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Building an intelligent agricultural ecosystem that integrates machine learning, predictive analytics, crop intelligence, and autonomous decision-making to improve productivity and support data-driven farming.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ==================================================== */}
        {/* SECTION 6 — SUPPORTING DEVELOPERS */}
        {/* ==================================================== */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              ENGINEERING COLLABORATORS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-card-foreground dark:text-white">
              Supporting Developers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SUPPORTING_DEVS.map((dev) => (
              <motion.div
                key={dev.id}
                whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015 }}
                className="glass-panel p-8 sm:p-10 rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start shadow-xl"
              >
                {/* 1. Profile Photo (Strict Uniform Dimensions & Aspect Ratio) */}
                <div className="relative shrink-0 group w-full sm:w-auto flex justify-center">
                  <div className="w-44 sm:w-48 md:w-52 h-[220px] sm:h-[250px] md:h-[270px] rounded-2xl p-1 bg-gradient-to-br from-primary/60 via-secondary/40 to-purple-600/30 shadow-xl transition-transform duration-500 group-hover:scale-105 shrink-0 overflow-hidden">
                    <img
                      src={dev.photo}
                      alt={dev.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top rounded-[14px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 flex-1 text-center sm:text-left">
                  <div>
                    {/* 2. Full Name */}
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{dev.name}</h3>

                    {/* 3. Branch & College */}
                    <p className="text-xs sm:text-sm font-bold text-muted-foreground mt-0.5">{dev.branchCollege}</p>

                    {/* 4. Role / Contribution Tag */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 text-xs font-extrabold mt-2.5 shadow-sm">
                      <Sparkles className="w-3 h-3 text-primary shrink-0" />
                      <span>{dev.roleTag}</span>
                    </div>
                  </div>

                  {/* 5. Short About */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium mt-1">
                    {dev.shortAbout}
                  </p>

                  {/* 6 & 7. LinkedIn and Email Actions */}
                  <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                    >
                      <Linkedin className="w-4 h-4 text-primary" />
                      <span>LinkedIn</span>
                    </a>
                    <a
                      href={`mailto:${dev.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                    >
                      <Mail className="w-4 h-4 text-primary" />
                      <span>Email</span>
                    </a>
                    {dev.portfolio && (
                      <a
                        href={dev.portfolio}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4 text-primary" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ==================================================== */}
        {/* SECTION 7 — TECHNICAL LEADERSHIP & MENTORS */}
        {/* ==================================================== */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              MENTORS & TECHNICAL LEADERSHIP
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-card-foreground dark:text-white">
              Technical Mentors & Heads
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl">
              Guiding the ISTE web team on modern web design, AI engineering practices, and production-grade deployment.
            </p>
          </div>

          <div className="flex flex-col gap-10">
            {WEB_MENTORS.map((mentor) => (
              <ScrollReveal key={mentor.id} yOffset={30}>
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { y: -6 }}
                  className="relative glass-panel rounded-[32px] border border-border/80 bg-card/40 dark:bg-slate-900/40 overflow-hidden shadow-2xl"
                >
                  {/* Ambient gradient wash */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-secondary/[0.07] pointer-events-none" />
                  <div className="absolute -top-24 -right-24 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none hidden dark:block" />

                  <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-12 items-center p-8 sm:p-12">
                    {/* Large Portrait */}
                    <div className="relative shrink-0 group">
                      <div className="w-56 sm:w-64 md:w-72 aspect-[4/5] rounded-3xl p-1 bg-gradient-to-br from-primary/70 via-secondary/50 to-purple-600/40 shadow-2xl transition-transform duration-500 group-hover:scale-[1.03] overflow-hidden">
                        <img
                          src={mentor.photo}
                          alt={mentor.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover object-top rounded-[20px]"
                        />
                      </div>
                      {/* Mentor Badge */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                        <Shield className="w-3 h-3" />
                        <span>{mentor.roleBadge}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-5 flex-1 text-center lg:text-left items-center lg:items-start">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground dark:text-white leading-none">
                          {mentor.name}
                        </h3>
                        <p className="text-[#7C3AED] dark:text-[#CF9FFF] text-xs sm:text-sm font-black uppercase tracking-wider">
                          {mentor.headline}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-muted-foreground">
                          {mentor.subHeadline}
                        </p>
                        <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground/80">
                          {mentor.branchCollege}
                        </p>
                      </div>

                      {/* Optional Stats (e.g. CGPA & Rank) */}
                      {mentor.stats && (
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                          {mentor.stats.map((s, idx) => (
                            <div key={idx} className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold flex items-center gap-2">
                              <span className="text-muted-foreground uppercase text-[10px] font-extrabold">{s.label}:</span>
                              <span className="text-primary font-black">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium max-w-2xl">
                        {mentor.bio}
                      </p>

                      {/* Expertise Chips */}
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 max-w-2xl">
                        {mentor.expertise.map((skill) => (
                          <span
                            key={skill}
                            className="px-3.5 py-1.5 rounded-full bg-card dark:bg-white/[0.03] border border-border dark:border-white/[0.06] backdrop-blur-md text-[11px] font-bold text-foreground hover:border-primary/50 dark:hover:border-[#CF9FFF]/30 transition-all shadow-sm cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Action Links */}
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                        {mentor.links.portfolio && (
                          <a
                            href={mentor.links.portfolio}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold hover:opacity-90 transition-all shadow-md"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Portfolio</span>
                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        )}
                        {mentor.links.github && (
                          <a
                            href={mentor.links.github}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                          >
                            <Github className="w-4 h-4 text-primary" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {mentor.links.linkedin && (
                          <a
                            href={mentor.links.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                          >
                            <Linkedin className="w-4 h-4 text-primary" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {mentor.links.twitter && (
                          <a
                            href={mentor.links.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                          >
                            <Twitter className="w-4 h-4 text-primary" />
                            <span>Twitter</span>
                          </a>
                        )}
                        <a
                          href={`mailto:${mentor.links.email}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                        >
                          <Mail className="w-4 h-4 text-primary" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ==================================================== */}
        {/* SECTION 8 — APPRECIATION QUOTE */}
        {/* ==================================================== */}
        <ScrollReveal yOffset={20}>
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/80 bg-gradient-to-r from-primary/10 via-background to-secondary/10 text-center flex flex-col items-center gap-4 max-w-4xl mx-auto shadow-xl">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <blockquote className="text-base sm:text-xl font-serif italic text-foreground leading-relaxed font-medium">
              "Great software is not built by one person. It is crafted through collaboration, curiosity, and continuous learning."
            </blockquote>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              — ISTE Web Engineering Team
            </p>
          </div>
        </ScrollReveal>

      </div>
    </div>
  )
}
