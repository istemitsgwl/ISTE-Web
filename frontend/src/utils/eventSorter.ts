/**
 * Sorts events in descending order (latest event date first).
 * Primary sort: eventDate / date (descending)
 * Secondary sort: createdAt (descending)
 */
export const sortEventsDescending = (eventsList: any[]): any[] => {
  const parseEventDate = (ev: any): number => {
    const rawDate = ev.eventDate || ev.date
    if (!rawDate) return 0

    // Handle Firestore Timestamp objects (.toDate())
    if (typeof rawDate === "object" && typeof rawDate.toDate === "function") {
      return rawDate.toDate().getTime()
    }
    if (rawDate instanceof Date) {
      return rawDate.getTime()
    }
    if (typeof rawDate === "number") {
      return rawDate
    }
    if (typeof rawDate === "string") {
      // Clean ordinal suffixes e.g. "26th-28th September 2025" -> "28 September 2025"
      let cleaned = rawDate.replace(/(\d+)(st|nd|rd|th)/gi, "$1")
      if (cleaned.includes("-")) {
        const parts = cleaned.split("-")
        cleaned = parts[parts.length - 1].trim()
      } else if (cleaned.includes("–")) {
        const parts = cleaned.split("–")
        cleaned = parts[parts.length - 1].trim()
      }
      const parsed = Date.parse(cleaned)
      if (!isNaN(parsed)) return parsed

      // Fallback: extract year e.g. "2025"
      const yearMatch = rawDate.match(/\b(20\d\d)\b/)
      if (yearMatch) return new Date(parseInt(yearMatch[1]), 0, 1).getTime()
    }
    return 0
  }

  const parseCreatedAt = (ev: any): number => {
    const raw = ev.createdAt
    if (!raw) return 0
    if (typeof raw === "object" && typeof raw.toDate === "function") {
      return raw.toDate().getTime()
    }
    if (raw instanceof Date) return raw.getTime()
    if (typeof raw === "number") return raw
    if (typeof raw === "string") {
      const p = Date.parse(raw)
      if (!isNaN(p)) return p
    }
    return 0
  }

  return [...eventsList].sort((a, b) => {
    const dateA = parseEventDate(a)
    const dateB = parseEventDate(b)
    if (dateA !== dateB) {
      return dateB - dateA // Primary sort: eventDate descending (latest first)
    }
    const createdA = parseCreatedAt(a)
    const createdB = parseCreatedAt(b)
    return createdB - createdA // Secondary sort: createdAt descending
  })
}
