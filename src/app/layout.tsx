import type { Metadata } from "next";
import { Noto_Serif_TC, Source_Serif_4, IBM_Plex_Mono, Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-tc",
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif-4",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "巴隆船長的航海日誌",
  description: "一個個人開發日誌——做了什麼 / 卡在哪 / 待辦 / 雜想。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClasses = `${notoSerifTC.variable} ${sourceSerif4.variable} ${ibmPlexMono.variable} ${inter.variable} ${notoSansTC.variable}`;
  return (
    <html lang="zh-Hant" className={fontClasses}>
      <body>{children}</body>
    </html>
  );
}
