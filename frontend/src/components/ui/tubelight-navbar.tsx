import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activePath?: string
  onItemClick?: (url: string) => void
}

export function NavBar({ items, className, activePath, onItemClick }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].url)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const currentActive = activePath !== undefined ? activePath : activeTab

  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-muted/40 dark:bg-muted/30 py-1.5 px-1.5 rounded-full border border-border/50 dark:border-border/40 relative",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = currentActive === item.url

        return (
          <Link
            key={item.name}
            to={item.url}
            onClick={() => {
              setActiveTab(item.url)
              if (onItemClick) onItemClick(item.url)
            }}
            className={cn(
              "relative cursor-pointer text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors duration-300 z-10",
              isActive 
                ? "text-primary dark:text-primary" 
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="inline">{item.name}</span>
            {isActive && (
              <motion.div
                layoutId="lamp"
                className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full">
                  <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                  <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                  <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                </div>
              </motion.div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
