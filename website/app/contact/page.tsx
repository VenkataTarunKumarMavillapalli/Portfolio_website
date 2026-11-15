import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Shell } from "@/components/ui/Shell";
import { ContactActions } from "@/components/ContactActions";
import { profile } from "@/lib/content";
import { assetPath } from "@/lib/paths";
export const metadata: Metadata = {title:"Contact",description:"Email me, connect on LinkedIn, explore GitHub or download my résumé."};
export default function ContactPage() {
 return <><PageHero title="Get in touch" description="If you’d like to talk about my work, a project or an opportunity, you can reach me here."/><section className="page-content"><Shell className="reading contact-content"><h2>Email</h2><a className="email-address" href={`mailto:${profile.email}`}>{profile.email.split("@")[0]}<wbr/>@{profile.email.split("@")[1]}</a><ContactActions/><div className="contact-links"><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><h2>LinkedIn</h2><p>My professional profile.</p></a><a href={profile.github} target="_blank" rel="noopener noreferrer"><h2>GitHub</h2><p>My code and repositories.</p></a><a href={assetPath("/Venkata-Resume.pdf")} download><h2>Download public résumé</h2><p>A public summary of my experience, education and credentials.</p></a></div></Shell></section></>;
}
