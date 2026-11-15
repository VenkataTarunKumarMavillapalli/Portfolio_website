import { assetPath } from "@/lib/paths";
import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/ui/Shell";
import { Label } from "@/components/ui/Label";
import { ContactActions } from "@/components/ContactActions";
import { profile } from "@/lib/content";
export const metadata:Metadata={title:"Contact",description:"Connect with Venkata Tarun about AI, data, research, and digital products."};
export default function ContactPage(){return <section className="contact-section"><Shell><div className="contact-intro"><Label>Let's connect</Label><h1>A conversation<br/>can open a door.</h1><p>Interested in AI, data, research, or building something useful?<br/>I'd be glad to hear from you.</p></div><div className="contact-panel"><div><span className="eyebrow">Email me</span><a className="email-address" href={`mailto:${profile.email}`}>{profile.email}</a><ContactActions/></div><div className="contact-options"><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><div><span className="eyebrow">Professional network</span><h2>Connect on LinkedIn</h2></div></a><a href={profile.github} target="_blank" rel="noopener noreferrer"><div><span className="eyebrow">Code & projects</span><h2>Find me on GitHub</h2></div></a><a href={assetPath("/Venkata-Resume.pdf")} download><div><span className="eyebrow">Experience & education</span><h2>Download my résumé</h2></div><span aria-hidden="true">↓</span></a></div></div><div className="contact-bottom"><p>{profile.name}<br/><span>{profile.role}</span></p><Link href="/work/" className="text-link">Explore my work →</Link></div></Shell></section>;}
