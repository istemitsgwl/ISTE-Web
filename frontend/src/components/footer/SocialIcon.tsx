import { LucideIcon } from "lucide-react"

interface SocialIconProps {
  href: string
  icon: LucideIcon
  label: string
}

export function SocialIcon({ href, icon: Icon, label }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="relative group p-2.5 rounded-xl bg-card/70 dark:bg-slate-900/80 border border-border/60 dark:border-border/40 text-muted-foreground hover:text-primary dark:hover:text-primary hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(0,243,255,0.25)] hover:-translate-y-1"
    >
      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
    </a>
  )
}
