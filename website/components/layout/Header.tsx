"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation, profile } from "@/lib/content";
import { Shell } from "@/components/ui/Shell";
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    function close(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); document.getElementById("menu-toggle")?.focus(); } }
    if (open) window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return <header className="site-header"><Shell className="header-inner">
    <Link className="wordmark" href="/" aria-label={`${profile.name}, home`}>{profile.name}<span aria-hidden="true">.</span></Link>
    <button id="menu-toggle" className="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
    <nav id="primary-nav" aria-label="Main navigation" className={open ? "main-nav is-open" : "main-nav"}>
      {navigation.map(item => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.slice(0,-1));
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}</Link>;
      })}
    </nav>
  </Shell></header>;
}
