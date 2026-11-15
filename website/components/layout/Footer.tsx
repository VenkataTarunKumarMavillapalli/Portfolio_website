import Link from "next/link";
import { profile } from "@/lib/content";
import { Shell } from "@/components/ui/Shell";

export function Footer() {
  return <footer className="site-footer"><Shell><div className="footer-top"><div><Link href="/" className="footer-name">Venkata Tarun<span>.</span></Link><p>AI, data, and the people behind the work.</p></div><div className="footer-links"><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a><Link href="/contact/">Get in touch →</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {profile.name}</span><span>A journey, still unfolding.</span></div></Shell></footer>;
}
