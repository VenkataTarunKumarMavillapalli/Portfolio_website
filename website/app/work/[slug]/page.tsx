import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects } from "@/lib/content";
import { Shell } from "@/components/ui/Shell";
export const dynamicParams=false;
export function generateStaticParams(){return projects.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=projects.find(p=>p.slug===slug);return{title:p?.title??"Project",description:p?.summary};}
export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const project=projects.find(p=>p.slug===slug);if(!project)notFound();const next=projects[(projects.indexOf(project)+1)%projects.length];
  return <><section className="project-hero"><Shell><Link href="/work/" className="back-link">← All work</Link><div className="project-hero-tags"><span>{project.category}</span><span>{project.kind}</span></div><h1>{project.title}</h1><p>{project.summary}</p><div className="project-hero-meta"><span>{project.context}</span><span>{project.period}</span></div></Shell></section><section className="section"><Shell><div className="case-layout"><aside className="case-aside"><span className="eyebrow">My contribution</span><h2>{project.role}</h2><span className="eyebrow">Tools & methods</span><div className="project-tags">{project.technologies.map(t=><span key={t}>{t}</span>)}</div><Link className="text-link" href="/journey/">View my journey →</Link></aside><div className="case-body"><section><span className="eyebrow">01 / The context</span><h2>The question behind the work.</h2><p>{project.challenge}</p></section><section><span className="eyebrow">02 / The contribution</span><h2>What I worked on.</h2><ol className="contribution-list">{project.contributions.map((c,i)=><li key={c}><span>{String(i+1).padStart(2,"0")}</span><p>{c}</p></li>)}</ol></section><section className="outcome-panel"><span className="eyebrow">03 / The outcome</span><h2>What the work contributed.</h2><p>{project.outcome}</p></section></div></div></Shell></section><section className="next-project"><Shell><div><Link href="/work/" className="text-link">← Back to the collection</Link><Link href={`/work/${next.slug}/`}><span className="eyebrow">Keep exploring</span><h2>{next.title}</h2></Link></div></Shell></section></>;
}
