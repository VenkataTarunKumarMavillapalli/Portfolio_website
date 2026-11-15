import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Shell } from "@/components/ui/Shell";
import { beyond } from "@/lib/content";
export const metadata:Metadata={title:"Beyond work",description:"Sport, volunteering, international experiences, and collaboration."};
export default function BeyondPage(){return <><PageHero label="Beyond work" title={<>There is more<br/>to the story.</>} description="The teams, communities, and experiences outside a job description also shape the person doing the work."/><section className="section"><Shell><div className="beyond-grid">{beyond.map(b=><article key={b.number} className="beyond-card"><span className="beyond-number">{b.number}</span><h2>{b.title}</h2><p>{b.description}</p><div className="project-tags">{b.tags.map(t=><span key={t}>{t}</span>)}</div></article>)}</div><div className="open-story"><span className="small-dot"/><p>There are more chapters to this journey.<br/><strong>This collection will grow with them.</strong></p></div></Shell></section></>;}
