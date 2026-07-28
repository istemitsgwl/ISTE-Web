import { useEffect, useState } from "react"

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
  animateOnce: _animateOnce = true,
  useHover = false
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  const triggerAnimation = () => {
    if (isAnimating) return
    setIsAnimating(true)
    let frame = 0
    const totalFrames = text.length * 3
    
    const interval = setInterval(() => {
      frame++
      
      const nextText = text
        .split("")
        .map((char, index) => {
          if (char === " ") return " "
          // determine if this character should be decrypted yet
          const threshold = (frame / totalFrames) * text.length
          if (index < threshold) {
            return char
          }
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join("")

      setDisplayText(nextText)

      if (frame >= totalFrames) {
        clearInterval(interval)
        setDisplayText(text)
        setIsAnimating(false)
        setHasAnimated(true)
      }
    }, speed)

    return () => clearInterval(interval)
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
    return () => clearTimeout(timeoutId)
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
