import { motion } from "framer-motion"

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  animateOnce?: boolean
  type?: "chars" | "words"
}

export function SplitText({
  text,
  className = "",
  delay = 0,
  duration = 0.5,
  animateOnce = true,
  type = "chars"
}: SplitTextProps) {
  const items = type === "chars" ? text.split("") : text.split(" ")

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: type === "chars" ? 0.03 : 0.1,
        delayChildren: delay,
      },
    },
  }

  const childVariants = {
    hidden: { y: "40%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: {
        duration: duration,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // easeOutExpo
      },
    },
  }

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: animateOnce, margin: "-10%" }}
    >
      {items.map((item, idx) => {
        // preserve spaces for characters
        if (type === "chars" && item === " ") {
          return <span key={idx}>&nbsp;</span>
        }
        return (
          <motion.span
            key={idx}
            className="inline-block"
            variants={childVariants}
          >
            {item}
            {type === "words" && idx < items.length - 1 && <span>&nbsp;</span>}
          </motion.span>
        )
      })}
    </motion.span>
  )
}
