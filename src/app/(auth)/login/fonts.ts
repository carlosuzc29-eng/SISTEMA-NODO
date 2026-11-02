import { Manrope, IBM_Plex_Mono } from "next/font/google";

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--sans",
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--mono",
  display: "swap",
});
