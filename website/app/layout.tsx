import { assetPath } from "@/lib/paths";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { profile } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${profile.name} | AI, Data & Digital Products`, template: `%s | ${profile.name}` },
  description: "Explore the work and journey of Venkata Tarun Kumar Mavillapalli: AI engineering, data science, research, and digital product development across international environments.",
  icons: { icon: assetPath("/favicon.svg") },
};

export default function RootLayout({children}:{children:ReactNode}) {
  return <html lang="en" data-scroll-behavior="smooth"><body><a href="#main-content" className="skip-link">Skip to content</a><Header/><main id="main-content" tabIndex={-1}>{children}</main><Footer/></body></html>;
}
