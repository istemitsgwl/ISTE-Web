import React from "react"
import { motion } from "framer-motion"

interface FooterSectionProps {
  title?: string
  children: React.ReactNode
  delay?: number
}

export function FooterSection({ title, children, delay = 0 }: FooterSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex flex-col gap-4"
    >
      {title && (
        <div className="flex flex-col gap-1.5 mb-1">
          <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-card-foreground dark:text-white flex items-center gap-2 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
            {title}
          </h4>
          <div className="w-10 h-[2px] bg-gradient-to-r from-primary via-secondary to-transparent rounded-full" />
        </div>
      )}
      {children}
    </motion.div>
  )
}
