import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export default function CircleGallery() {
  const [images, setImages] = useState<any[]>([])
  const [angle, setAngle] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const snap = await getDocs(collection(db, "gallery"))
        const items: any[] = []
        snap.forEach((doc) => {
          const data = doc.data()
          if (data && data.image) {
            items.push({ id: doc.id, ...data })
          }
        })
        setImages(items.slice(0, 8))
      } catch (err) {
        console.warn("Failed to fetch gallery for CircleGallery:", err)
      }
    }
    fetchGallery()
  }, [])

  useEffect(() => {
    if (hoveredIndex !== null || images.length === 0) return // Pause rotation on hover or empty

    const interval = setInterval(() => {
      setAngle((prev) => prev + 0.15)
    }, 16) // Smooth 60fps rotation ticks

    return () => clearInterval(interval)
  }, [hoveredIndex, images])

  const radius = 240 // Circle radius in pixels

  return (
    <div className="relative w-full h-[520px] flex items-center justify-center overflow-hidden pointer-events-auto">
      {/* Visual background rings */}
      <div className="absolute w-[480px] h-[480px] rounded-full border border-primary/5 pointer-events-none" />
      <div className="absolute w-[360px] h-[360px] rounded-full border border-secondary/5 border-dashed pointer-events-none" />

      {/* Rotating Circle Container */}
      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1000px" }}>
        {images.map((item, idx) => {
          // Calculate angular offset for 3D placement
          const elementAngle = (idx * (360 / images.length) + angle) * (Math.PI / 180)
          
          // Translate 2D circular positions
          const x = Math.sin(elementAngle) * radius
          const z = Math.cos(elementAngle) * radius
          const scale = 0.6 + ((z + radius) / (radius * 2)) * 0.45 // Perspective scale modifier

          const isHovered = hoveredIndex === idx

          return (
            <motion.div
              key={item.id}
              className="absolute w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border border-border/80 bg-card/95 dark:bg-card/45 shadow-card cursor-pointer origin-center transition-all duration-300"
              style={{
                x,
                z,
                scale: isHovered ? 1.15 : scale,
                zIndex: Math.round(z + radius) + (isHovered ? 100 : 0),
                filter: isHovered ? "brightness(1.1) contrast(1.05)" : `blur(${Math.max(0, (radius - z) / 80)}px) brightness(${0.5 + ((z + radius) / (radius * 2)) * 0.5})`,
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{
                boxShadow: "var(--shadow-card)",
                borderColor: "var(--primary)",
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary">{item.category}</span>
                <p className="text-[10px] text-card-foreground dark:text-white font-bold truncate mt-0.5">{item.title}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
