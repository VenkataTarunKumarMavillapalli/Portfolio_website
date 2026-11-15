import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { work } from "@/lib/content";
import { Shell } from "@/components/ui/Shell";
export const dynamicParams=false;
export function generateStaticParams(){return work.map(item=>({slug:item.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const item=work.find(item=>item.slug===slug);return{title:item?.title??"Work",description:item?.summary};}
export default async function WorkDetail({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;const item=work.find(item=>item.slug===slug);if(!item)notFound();
 return <article className="detail-page"><Shell className="reading"><Link className="back-link" href="/work/">Back to my work</Link>
 <header className="detail-heading"><p className="eyebrow">{item.organisation}</p><h1>{item.title}</h1><p className="detail-summary">{item.summary}</p>
 <dl className="detail-meta">{item.role !== item.title && <div><dt>Role</dt><dd>{item.role}</dd></div>}{item.start&&<div><dt>When</dt><dd>{item.period}</dd></div>}{item.location&&<div><dt>Where</dt><dd>{item.location}</dd></div>}</dl>{item.repositoryUrl && <a className="text-link" href={item.repositoryUrl} target="_blank" rel="noopener noreferrer">View code on GitHub</a>}</header>
 <div className="prose-section"><h2>About the work</h2>{item.overview.map(text=><p key={text}>{text}</p>)}</div>
 {item.sections.map(section=><section className="prose-section" key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}
 {(item.closing || item.tools.length > 0) && <section className="prose-section"><h2>What this work involved</h2>{item.closing && <p>{item.closing}</p>}{item.tools.length > 0 && <p className="tools"><strong>Tools and methods:</strong> {item.tools.join(", ")}.</p>}</section>}
 <div className="related-links"><Link href="/work/">Explore more work</Link>{item.kind==="Experience"&&<Link href="/timeline/">See the timeline</Link>}</div>
 </Shell></article>;
}
