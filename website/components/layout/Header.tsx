"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation } from "@/lib/content";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label="Venkata Tarun, home"><span className="monogram" aria-hidden="true">vt<span>.</span></span><span className="wordmark-name">VENKATA TARUN<span>AI · DATA · DIGITAL PRODUCTS</span></span></Link>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}<span aria-hidden="true">{open ? "×" : "☰"}</span></button>
        <nav id="primary-nav" aria-label="Main navigation" className={open ? "main-nav is-open" : "main-nav"}>
          {navigation.map(item => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.slice(0,-1));
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={active ? "active" : ""}>{item.label}</Link>;
          })}
        </nav>
      </div>
    </header>
  );
}
