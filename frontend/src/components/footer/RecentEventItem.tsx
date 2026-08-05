import { Link } from "react-router-dom"
import { Calendar, ArrowRight } from "lucide-react"
import { resolveEventImage } from "@/utils/imageResolver"

interface RecentEventItemProps {
  event: any
}

export function RecentEventItem({ event }: RecentEventItemProps) {
  return (
    <Link
      to="/events"
      className="group/evt flex items-center gap-3 p-2 rounded-xl hover:bg-card/40 dark:hover:bg-slate-900/40 border border-transparent hover:border-border/40 transition-all duration-300"
    >
      <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-border/40 bg-slate-950 relative">
        <img
          src={resolveEventImage(event.bannerImage || event.image)}
          alt={event.title}
          className="w-full h-full object-cover group-hover/evt:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <h5 className="text-xs font-bold text-foreground dark:text-white truncate group-hover/evt:text-primary transition-colors">
          {event.title}
        </h5>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
          <Calendar className="w-3 h-3 text-primary shrink-0" />
          <span className="truncate">{event.date}</span>
        </div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/evt:opacity-100 group-hover/evt:text-primary group-hover/evt:translate-x-1 transition-all shrink-0" />
    </Link>
  )
}
