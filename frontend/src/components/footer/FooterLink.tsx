import React from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

interface FooterLinkProps {
  to?: string
  href?: string
  children: React.ReactNode
  external?: boolean
}

export function FooterLink({ to, href, children, external }: FooterLinkProps) {
  const content = (
    <span className="group/link inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all duration-300 font-semibold cursor-pointer">
      <ChevronRight className="w-3 h-3 text-primary opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all duration-300 shrink-0" />
      <span className="group-hover/link:translate-x-1 transition-transform duration-300">
        {children}
      </span>
    </span>
  )

  if (external && href) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {content}
      </a>
    )
  }

  return <Link to={to || "#"}>{content}</Link>
}
