import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import styles from "./blueprint.module.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--bp-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--bp-mono",
  display: "swap",
});

export const metadata = { title: "Blueprint Demo · 巴隆船長的航海日誌" };

export default function BlueprintDemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable} ${styles.shell}`}>
      {children}
    </div>
  );
}
