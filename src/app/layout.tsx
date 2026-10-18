import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo, Spectral, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { SITE_URL } from "@/lib/tracks/urls";
import { SITE_NAME } from "@/lib/tracks/seo";
import { SEO_COPY } from "@/lib/tracks/seoText";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// Home page and lesson type family (see src/styles/home.css, learn.css).
// Archivo is the brand face, used condensed (font-stretch) for the name,
// headings on the home page and small labels.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});


export const metadata: Metadata = {
  // Relative canonical / Open Graph URLs resolve against the public domain
  metadataBase: new URL(SITE_URL),
  // Fallbacks; every page sets its own (src/lib/tracks/seo.ts)
  title: SITE_NAME,
  description: SEO_COPY.en.learnDesc,
  applicationName: SITE_NAME,
};


export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${spectral.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}>

        <LanguageProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LanguageProvider>

        <Analytics />

      </body>
    </html>
  );
}
