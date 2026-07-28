import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { BorderGlowCard } from "@/components/ui/BorderGlowCard"
import { SplitText } from "@/components/animations/SplitText"
import { BlurText } from "@/components/animations/BlurText"
import { DecryptedText } from "@/components/animations/DecryptedText"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import fallbackImage from "@/assets/gallery/iste.jpg"

export default function Gallery() {
  const [filter, setFilter] = useState("all")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true)
      try {
        const snap = await getDocs(collection(db, "gallery"))
        const data: any[] = []
        snap.forEach((doc) => {
          const item = doc.data()
          if (item && item.image) {
            data.push({ id: doc.id, ...item })
          }
        })
        setGalleryItems(data)
      } catch (err) {
        console.warn("Could not retrieve dynamic gallery items from Firestore:", err)
        setGalleryItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [])

  const categories = ["all", "Events", "Talks", "Team", "Workshops", "Awards"]

  const filteredItems = galleryItems.filter((item) => {
    if (filter === "all") return true
    return item.category.toLowerCase() === filter.toLowerCase()
  })

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const navigateLightbox = (dir: "prev" | "next") => {
    if (lightboxIndex === null) return
    let newIndex = lightboxIndex
    if (dir === "prev") {
      newIndex = lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1
    } else {
      newIndex = lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1
    }
    setLightboxIndex(newIndex)
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative pt-32 sm:pt-36 pb-16 px-4 sm:px-6 transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-0 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Title Header */}
        <div className="text-center mb-12 select-none">
          <div className="mb-6 inline-block">
            <DecryptedText 
              text="PHOTO GALLERY" 
              className="text-xs font-black tracking-[0.2em] text-secondary uppercase bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20" 
              speed={40} 
              delay={0.1} 
            />
          </div>
          <h1 className="flex flex-col items-center gap-1 sm:gap-2 tracking-tight leading-[1.05] mt-2">
            <SplitText 
              text="Our Gallery &" 
              type="words" 
              className="text-[2.2rem] sm:text-[4rem] md:text-[5rem] font-light font-serif text-card-foreground dark:text-white" 
            />
            <SplitText 
              text="Visual Ledger" 
              type="words" 
              className="font-serif italic font-normal text-[2.75rem] sm:text-[4.5rem] md:text-[5.5rem] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.1)] dark:drop-shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
            />
          </h1>
          <ScrollReveal delay={0.2} yOffset={15}>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg font-medium">
              A compilation of memories from flagship forums, collaborative programming, leadership summits, and award ceremonies.
            </p>
          </ScrollReveal>
        </div>

        {/* Category Selector */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                filter.toLowerCase() === cat.toLowerCase()
                  ? "bg-primary text-slate-950 border-primary shadow-[0_0_15px_rgba(0,243,255,0.25)]"
                  : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-muted-foreground">Loading visual gallery...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl p-12 text-center border border-border/80 bg-card/40 dark:bg-card/20 max-w-xl mx-auto flex flex-col items-center my-8 shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 shadow-inner">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Visual Gallery Empty</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {filter === "all"
                ? "No photo memories have been uploaded to the database yet. Check back soon for event highlights!"
                : `No gallery photos found for category "${filter}".`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                key={item.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="cursor-pointer"
                onClick={() => openLightbox(idx)}
              >
                <div className="p-2 bg-white/55 dark:bg-card/40 rounded-[24px] border border-[rgba(255,255,255,0.45)] dark:border-border/20 shadow-[0_12px_40px_rgba(25,50,80,0.08)] transition-all hover:translate-y-[-10px] hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(25,50,80,0.12)] duration-500 group aspect-[4/3] relative overflow-hidden">
                  <div className="w-full h-full rounded-[16px] overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImage
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider mb-1">
                        {item.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-tight mb-2 truncate">{item.title}</h4>
                      <div className="self-end p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                        <Maximize2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900 border border-border/80 hover:border-primary/40 hover:text-primary transition-all text-muted-foreground z-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev Trigger */}
            <button
              onClick={() => navigateLightbox("prev")}
              className="absolute left-4 p-2.5 rounded-full bg-slate-900 border border-border/80 hover:border-primary/45 hover:text-primary transition-all text-muted-foreground z-40 hidden md:block cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Contents View */}
            <div className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center relative px-8">
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={filteredItems[lightboxIndex].image}
                alt={filteredItems[lightboxIndex].title}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl border border-white/10"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage
                }}
              />
              <div className="mt-4 text-center">
                <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider">
                  {filteredItems[lightboxIndex].category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                  {filteredItems[lightboxIndex].title}
                </h3>
              </div>
            </div>

            {/* Next Trigger */}
            <button
              onClick={() => navigateLightbox("next")}
              className="absolute right-4 p-2.5 rounded-full bg-slate-900 border border-border/80 hover:border-primary/45 hover:text-primary transition-all text-muted-foreground z-40 hidden md:block cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
