import { Mail, Phone, MapPin, Map, ExternalLink } from "lucide-react"

export interface ContactInfo {
  email?: string
  phone?: string
  address?: string
}

interface ContactCardProps {
  contactData: ContactInfo
}

export function ContactCard({ contactData }: ContactCardProps) {
  const email = contactData?.email || "iste.mits.gwl@gmail.com"
  const phone = contactData?.phone || "9926245805"
  const address = contactData?.address || "MITS Gwalior, Madhya Pradesh, India"

  return (
    <div className="glass-panel p-4 rounded-2xl border border-border/50 dark:border-border/30 flex flex-col gap-3.5 text-xs text-muted-foreground backdrop-blur-md shadow-sm">
      <a
        href={`mailto:${email}`}
        className="flex items-center gap-3 hover:text-primary transition-colors group/item"
      >
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/item:scale-105 transition-transform">
          <Mail className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold truncate">{email}</span>
      </a>

      <a
        href={`tel:${phone}`}
        className="flex items-center gap-3 hover:text-primary transition-colors group/item"
      >
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/item:scale-105 transition-transform">
          <Phone className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold">+91 {phone}</span>
      </a>

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
          <MapPin className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold leading-relaxed">{address}</span>
      </div>

      <div className="pt-2 border-t border-border/40 flex items-center gap-2">
        <a
          href="https://maps.google.com/?q=MITS+Gwalior"
          target="_blank"
          rel="noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-card dark:bg-slate-900 border border-border/60 text-[11px] font-bold text-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
        >
          <Map className="w-3.5 h-3.5 text-primary" />
          <span>Google Maps</span>
        </a>
        <a
          href="https://linktr.ee/iste_mits_gwl"
          target="_blank"
          rel="noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-slate-950 text-[11px] font-extrabold hover:bg-cyan-300 transition-all shadow-sm"
        >
          <span>Linktree</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
