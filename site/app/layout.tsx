import "../styles/index.css";
import { themeChange } from "theme-change";
import { Metadata } from "next";
import Script from 'next/script'

const siteDescription = "Read Free Webtoon's, Manga's, and Novel's Anywhere With A Touch Of A Button On Enryu!";

export const metadata: Metadata = {
  title: {
    template: "Enryu | %s",
    default: "Enryu",
  },
  applicationName: "Enryu",
  description: siteDescription,
  openGraph: {
    title: "Enryu",
    description: siteDescription,
    url: "https://enryumanga.com",
    siteName: "Enryu",
    images: [
      {
        url: "https://i.imgur.com/G7HDose.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Enryu",
    description: siteDescription,
    creator: "@enryumanga",
    images: {
      url: "https://i.imgur.com/G7HDose.png",
      alt: "Enryu home page",
    },
    site: "https://enryumanga.com/",
  },
  icons: {
    apple: [
      { url: "/icons/touch-icon-iphone.png" },
      {
        url: "/icons/touch-icon-ipad.png",
        sizes: "152x152",
      },
      {
        url: "/icons/touch-icon-iphone-retina.png",
        sizes: "180x180",
      },
      {
        url: "/icons/touch-icon-ipad-retina.png",
        sizes: "167x167",
      },
    ],
    icon: [
      {
        url: "/icons/favicon-32x32.png",
        sizes: "32x32",
      },
      {
        url: "/icons/favicon-16x16.png",
        sizes: "16x16",
      },
    ],
  },
  themeColor: "#000000",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Enryu",
    statusBarStyle: "default",
    capable: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = typeof window === "undefined" ? undefined : window.localStorage.getItem("theme");
  // @ts-ignore shut up
  if (theme) themeChange(theme);

  return (
    <html lang="en">
      <body>{children}</body>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6216514032813165"
        crossOrigin="anonymous"
      ></Script>
    </html>
  );
}
