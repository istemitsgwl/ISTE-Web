import React, { useRef, useEffect, useCallback } from "react"
import { useLocation } from "react-router-dom"

export interface ClickSparkProps {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: string
  extraScale?: number
  children?: React.ReactNode
}

interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
}

export default function ClickSpark({
  sparkColor = "#CF9FFF",
  sparkSize = 12,
  sparkRadius = 25,
  sparkCount = 10,
  duration = 500,
  easing = "ease-out",
  extraScale = 1.0,
  children
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sparksRef = useRef<Spark[]>([])
  const isAnimatingRef = useRef<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    let resizeTimeout: any

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr
        canvas.height = height * dpr
      }
    }

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resizeCanvas, 100)
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(parent)

    resizeCanvas()

    return () => {
      ro.disconnect()
      clearTimeout(resizeTimeout)
    }
  }, [])

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case "linear":
          return t
        case "ease-in":
          return t * t
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        default:
          return t * (2 - t)
      }
    },
    [easing]
  )

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current
      if (!canvas) {
        isAnimatingRef.current = false
        return
      }
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        isAnimatingRef.current = false
        return
      }

      const dpr = window.devicePixelRatio || 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime
        if (elapsed >= duration) {
          return false
        }

        const progress = elapsed / duration
        const eased = easeFunc(progress)

        const distance = eased * sparkRadius * extraScale * dpr
        const lineLength = sparkSize * (1 - eased) * dpr

        const x1 = spark.x * dpr + distance * Math.cos(spark.angle)
        const y1 = spark.y * dpr + distance * Math.sin(spark.angle)
        const x2 = spark.x * dpr + (distance + lineLength) * Math.cos(spark.angle)
        const y2 = spark.y * dpr + (distance + lineLength) * Math.sin(spark.angle)

        ctx.strokeStyle = sparkColor
        ctx.lineWidth = 2 * dpr
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        return true
      })

      if (sparksRef.current.length > 0) {
        requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        isAnimatingRef.current = false
      }
    },
    [sparkColor, sparkSize, sparkRadius, duration, easeFunc, extraScale]
  )

  const location = useLocation()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable click spark on mobile view for /team and /gallery to optimize INP performance
    const isMobile = window.innerWidth < 768
    const path = location.pathname.toLowerCase()
    if (isMobile && (path === "/team" || path === "/gallery")) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const now = performance.now()
    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now
    }))

    sparksRef.current.push(...newSparks)

    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true
      requestAnimationFrame(draw)
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100vh"
      }}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          userSelect: "none",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 9999
        }}
      />
      {children}
    </div>
  )
}
