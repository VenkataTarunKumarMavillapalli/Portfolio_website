import Link from "next/link";
import { profile } from "@/lib/content";
import { Shell } from "@/components/ui/Shell";
export function Footer() {
  return <footer className="site-footer"><Shell><p>© {new Date().getFullYear()} {profile.shortName}</p><div><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a><Link href="/contact/">Contact</Link></div></Shell></footer>;
}
