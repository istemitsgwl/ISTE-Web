import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface BorderGlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  glowColor?: string
  className?: string
  containerClassName?: string
}

export function BorderGlowCard({
  children,
  glowColor = "rgba(0, 243, 255, 0.15)",
  className,
  containerClassName,
  ...props
}: BorderGlowCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-[24px] border border-border bg-card p-6 backdrop-blur-md transition-all duration-300 shadow-sm hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-lg hover:border-primary dark:hover:border-primary",
        containerClassName
      )}
      {...props}
    >
      {/* Dynamic Glow Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              350px circle at ${mouseX}px ${mouseY}px,
              var(--primary-glow),
              transparent 80%
            )
          `,
        }}
      />
      <div className={cn("relative z-10 flex flex-col h-full", className)}>
        {children}
      </div>
    </div>
  )
}
