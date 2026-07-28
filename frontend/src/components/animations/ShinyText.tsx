import React from "react"

interface ShinyTextProps {
  text: string
  className?: string
  disabled?: boolean
  speed?: number // speed in seconds
}

export function ShinyText({
  text,
  className = "",
  disabled = false,
  speed = 3
}: ShinyTextProps) {
  const style: React.CSSProperties = disabled
    ? {}
    : {
        backgroundImage:
          "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        animation: `shimmer ${speed}s infinite linear`,
      }

  return (
    <span
      style={style}
      className={`inline-block text-transparent bg-clip-text ${className}`}
    >
      {text}
    </span>
  )
}
