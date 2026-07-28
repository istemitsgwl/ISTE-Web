import { motion } from "framer-motion"
import { ReactNode } from "react"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  animateOnce?: boolean
  yOffset?: number
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  animateOnce = true,
  yOffset = 24
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: animateOnce, margin: "-10%" }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.215, 0.61, 0.355, 1], // cubic-bezier matching modern tech sites
      }}
    >
      {children}
    </motion.div>
  )
}
