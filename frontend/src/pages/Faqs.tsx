import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { faqs as staticFaqs } from "@/data/siteData"
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { SplitText } from "@/components/animations/SplitText"
import { BlurText } from "@/components/animations/BlurText"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [faqList, setFaqList] = useState<any[]>(staticFaqs)

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const snap = await getDocs(collection(db, "faqs"))
        const data: any[] = []
        snap.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() })
        })
        if (data.length > 0) {
          setFaqList(data)
        } else {
          setFaqList(staticFaqs)
        }
      } catch (err) {
        console.warn("Could not fetch FAQs from Firestore. Using static backup.", err)
      }
    }
    fetchFaqs()
  }, [])

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative pt-32 sm:pt-36 pb-16 px-4 sm:px-6 transition-colors duration-300">
      {/* Background Accent Glows */}
      <div className="absolute top-[20%] right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-0 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="container mx-auto max-w-3xl relative z-10">
        {/* Title Block */}
        <div className="text-center mb-16 select-none">
          <div className="mb-6 inline-block">
            <DecryptedText 
              text="FAQs & RESOLUTION" 
              className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
              speed={40} 
              delay={0.1} 
            />
          </div>
          <h1 className="flex flex-col items-center gap-1 sm:gap-2 tracking-tight leading-[1.05] mt-2">
            <SplitText 
              text="Frequently Asked" 
              type="words" 
              className="text-[2.2rem] sm:text-[4rem] md:text-[5rem] font-light font-serif text-card-foreground dark:text-white" 
            />
            <SplitText 
              text="Questions" 
              type="words" 
              className="font-serif italic font-normal text-[2.75rem] sm:text-[4.5rem] md:text-[5.5rem] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.1)] dark:drop-shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
            />
          </h1>
          <ScrollReveal delay={0.2} yOffset={15}>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
              Have inquiries? Here are the most frequently asked queries about memberships, event qualifications, certificates, and registrations.
            </p>
          </ScrollReveal>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-4">
          {faqList.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`glass-panel overflow-hidden rounded-2xl border transition-colors bg-card/25 backdrop-blur-md ${
                  isOpen ? "border-primary/45" : "border-border/60"
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 select-none hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3 font-bold text-foreground text-sm sm:text-base">
                    <HelpCircle className={`w-5 h-5 ${isOpen ? "text-primary" : "text-muted-foreground"} shrink-0`} />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "transform rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-muted-foreground text-xs sm:text-sm leading-relaxed border-t border-border/40 pt-4 bg-muted/20 font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
