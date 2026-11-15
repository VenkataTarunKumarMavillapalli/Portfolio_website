import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Shell } from "@/components/ui/Shell";
export const metadata: Metadata = {title:"About me",description:"My background in computer science, data science, AI engineering and digital products."};
export default function AboutPage() {
 return <><PageHero title="About me" description="I’m Venkata Tarun Kumar Mavillapalli, an AI engineer and data professional."/>
 <section className="page-content"><Shell className="reading"><div className="prose-section"><h2>My background</h2>
 <p>My background combines computer science, data science and digital product development. I studied computer science through a three-continental programme in India, the United Kingdom and the United States, then completed a master’s in Data Science at the University of Naples Federico II in Italy.</p>
 <p>I also spent nine months at the Apple Developer Academy, working in international teams on iOS apps, design and product development. That experience connected the technical work with questions about who a product is for, how it works for them and how an idea can become something usable.</p>
 <p>My professional experience includes the World Food Programme, the European Food Safety Authority, academic research, NeuraFlash and the A.J. Drexel Autism Institute. Across these roles, I’ve worked on AI systems, data quality, dashboards, automation and software development.</p>
 <Link className="text-link" href="/timeline/">Follow the timeline</Link></div>
 <div className="prose-section"><h2>What I work on</h2>
 <p>In AI engineering, I’ve built systems that find information in documents, connect models to tools and help people draft or review material. Much of this work uses Azure services, with attention to source references, access controls, monitoring and human review.</p>
 <p>In data work, I’ve built dashboards, validation rules and pipelines that help teams check information and understand their operations. I’ve also automated repetitive tasks such as reporting refreshes, ticket updates and approval workflows.</p>
 <p>My roles have included writing documentation, working through feedback with colleagues, testing changes and preparing handovers. Those activities help the work remain understandable and usable after the initial implementation.</p>
 <Link className="text-link" href="/work/">Read about my work</Link></div>
 <div className="prose-section" id="outside-work"><h2>Outside my professional work</h2>
 <p>During university, I was a member of the Computer Society of India and the Sports Club. I took part in Sangathan sports events, earning a bronze medal in chess and a gold medal in carrom, and also played cricket.</p>
 <p>I volunteered as an escort for international guests at Confluence 2017 and served as Assistant Head for Organising and Management at Amity Youth Fest. These were part of my university life alongside the academic programme.</p>
 </div></Shell></section></>;
}
