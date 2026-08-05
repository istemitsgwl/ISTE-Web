import { useEffect, useState, useRef } from "react"

interface DecryptedTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
  animateOnce?: boolean
  useHover?: boolean
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+?"

export function DecryptedText({
  text,
  className = "",
  delay = 0,
  speed = 40,
  animateOnce = true,
  useHover = false
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const triggerAnimation = () => {
    if (isAnimating) return
    setIsAnimating(true)
    let frame = 0
    const totalFrames = text.length * 3
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      frame++
      
      const nextText = text
        .split("")
        .map((char, index) => {
          if (char === " ") return " "
          const threshold = (frame / totalFrames) * text.length
          if (index < threshold) {
            return char
          }
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join("")

      setDisplayText(nextText)

      if (frame >= totalFrames) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setDisplayText(text)
        setIsAnimating(false)
        setHasAnimated(true)
      }
    }, speed)
  }

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    if (!hasAnimated) {
      timeoutId = setTimeout(() => {
        triggerAnimation()
      }, delay * 1000)
    } else {
      setDisplayText(text)
    }

    return () => {
      clearTimeout(timeoutId)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [text, delay])

  const handleMouseEnter = () => {
    if (useHover && !isAnimating) {
      triggerAnimation()
    }
  }

  return (
    <span 
      className={`font-mono inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {displayText || text}
    </span>
  )
}
