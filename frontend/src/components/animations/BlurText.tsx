import { motion } from "framer-motion"

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  animateOnce?: boolean
}

export function BlurText({
  text,
  className = "",
  delay = 0,
  duration = 0.6,
  animateOnce = true
}: BlurTextProps) {
  const words = text.split(" ")

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  }

  const childVariants = {
    hidden: { filter: "blur(10px)", opacity: 0, y: 10 },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      y: 0,
      transition: {
        duration: duration,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
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
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          className="inline-block mr-[0.25em]"
          variants={childVariants}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}
