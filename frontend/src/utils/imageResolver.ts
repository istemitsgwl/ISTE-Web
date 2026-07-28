import Esummit from "@/assets/Events/e-summit-iste.jpg"
import Enigma from "@/assets/Events/enigma-2025.webp"
import Xcalibre from "@/assets/Events/xcalibire-23.webp"

export const resolveEventImage = (imagePath: string | undefined): string => {
  if (!imagePath) return Esummit;
  if (imagePath.startsWith("data:image/") || imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  const pathLower = imagePath.toLowerCase();
  if (pathLower.includes("enigma")) return Enigma;
  if (pathLower.includes("xcalibire") || pathLower.includes("x-calibre")) return Xcalibre;
  if (pathLower.includes("e-summit")) return Esummit;
  
  return imagePath;
}
