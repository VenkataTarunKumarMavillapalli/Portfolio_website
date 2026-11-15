import Link from "next/link";
import type { WorkItem } from "@/lib/content";
export function ProjectCard({item}: {item:WorkItem}) {
 return <article className="work-row"><div className="work-period"><p>{item.kind==="Experience"?item.period:"Project"}</p>{item.location&&<span>{item.location}</span>}</div><div><p className="organisation">{item.organisation}</p><h2><Link href={`/work/${item.slug}/`}>{item.title}</Link></h2><p>{item.summary}</p><Link className="text-link" href={`/work/${item.slug}/`} aria-label={`Read more about ${item.title}`}>Read more</Link></div></article>;
}
