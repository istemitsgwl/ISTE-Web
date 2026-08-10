import { useEffect } from "react"

const SITE_URL = "https://iste.mitsgwalior.in"
const SITE_NAME = "ISTE Student's Chapter – MITS DU Gwalior"

interface SeoProps {
  /** Page title; omitted → site default */
  title?: string
  description?: string
  /** Route path used for the canonical URL, e.g. "/events" */
  path?: string
  /** Set true on private/admin pages to keep them out of search engines */
  noIndex?: boolean
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

/**
 * Updates document title, meta description, canonical URL, and social tags
 * per route. Renders nothing.
 */
export default function Seo({ title, description, path = "/", noIndex = false }: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ISTE MITS Gwalior` : SITE_NAME
    const url = `${SITE_URL}${path === "/" ? "/" : path}`

    document.title = fullTitle
    upsertMeta("property", "og:title", fullTitle)
    upsertMeta("name", "twitter:title", fullTitle)
    upsertMeta("property", "og:url", url)
    upsertMeta("name", "twitter:url", url)
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow")

    if (description) {
      upsertMeta("name", "description", description)
      upsertMeta("property", "og:description", description)
      upsertMeta("name", "twitter:description", description)
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [title, description, path, noIndex])

  return null
}
