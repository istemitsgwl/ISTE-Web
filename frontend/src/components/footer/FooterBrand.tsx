import React, { useState, useRef } from "react"
import { useTheme } from "@/context/ThemeContext"

export function FooterBrand() {
  const { theme } = useTheme()
  const [isActivated, setIsActivated] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Click Handler — toggles foreground text color cleanly without motion animations
  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsActivated(true)

    // Reset back to main default color after 2.5 seconds
    timerRef.current = setTimeout(() => {
      setIsActivated(false)
    }, 2500)
  }

  const activeAccentColor = theme === "dark" ? "#CF9FFF" : "#7C3AED"
  const defaultTextColor = theme === "dark" ? "#4f8ef7" : "#2563EB"
  const defaultOpacity = theme === "dark" ? 0.45 : 0.75

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleClick}
      className="relative w-full overflow-hidden select-none bg-transparent pt-1 pb-1 flex flex-col items-center justify-center cursor-pointer"
    >
      {/* Giant Edge-to-Edge Static Typography "ISTE" */}
      <h1
        style={{
          fontSize: "clamp(4.5rem, 24vw, 28rem)",
          lineHeight: 0.8,
          color: isActivated ? activeAccentColor : defaultTextColor,
          opacity: isActivated ? 1 : defaultOpacity,
        }}
        className="font-black uppercase tracking-[-0.04em] text-center w-full transition-colors duration-300"
      >
        ISTE
      </h1>

      {/* Subtitle Underneath with Tight Spacing */}
      <p
        style={{
          color: isActivated ? activeAccentColor : defaultTextColor,
          opacity: isActivated ? 0.9 : 0.75,
        }}
        className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.32em] text-center mt-2 sm:mt-3 transition-colors duration-300"
      >
        INDIAN SOCIETY FOR TECHNICAL EDUCATION • MITS GWALIOR
      </p>
    </div>
  )
}
