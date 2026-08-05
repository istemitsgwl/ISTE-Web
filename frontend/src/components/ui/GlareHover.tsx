import React, { useRef, useState } from "react"

export interface GlareHoverProps {
  children: React.ReactNode
  glareColor?: string
  glareOpacity?: number
  glareAngle?: number
  glareSize?: number
  transitionDuration?: number
  playOnce?: boolean
  className?: string
}

export function GlareHover({
  children,
  glareColor = "#CF9FFF",
  glareOpacity = 0.22,
  glareAngle = -35,
  glareSize = 280,
  transitionDuration = 900,
  playOnce = false,
  className = "",
}: GlareHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return
    if (!containerRef.current) return
    if (playOnce && hasPlayed) return

    const x = (e.nativeEvent.offsetX / (containerRef.current.clientWidth || 1)) * 100
    const y = (e.nativeEvent.offsetY / (containerRef.current.clientHeight || 1)) * 100

    setGlarePos({ x, y })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (playOnce) setHasPlayed(true)
  }

  // Convert angle to gradient directional vector
  const rad = (glareAngle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ease-out transform-gpu will-change-transform ${
        isHovered
          ? "scale-[1.02] -translate-y-[6px] border-[#CF9FFF]/40 dark:border-[#CF9FFF]/40 shadow-[0_12px_30px_-5px_rgba(207,159,255,0.22)]"
          : "border-border/60 shadow-md"
      } ${className}`}
    >
      {/* Card Content */}
      <div className="relative z-10 h-full">{children}</div>

      {/* Radial Specular Glare Effect Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl transition-opacity ease-out"
        style={{
          opacity: isHovered ? glareOpacity : 0,
          transitionDuration: `${transitionDuration}ms`,
          background: `radial-gradient(circle ${glareSize}px at ${glarePos.x}% ${glarePos.y}%, ${glareColor}, transparent 70%), linear-gradient(${glareAngle}deg, transparent 30%, ${glareColor}44 50%, transparent 70%)`,
          mixBlendMode: "screen",
        }}
      />
    </div>
  )
}
