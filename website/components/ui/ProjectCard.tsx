import Link from "next/link";
import type { Project } from "@/lib/content";

export function ProjectCard({project,index=0}: {project:Project;index?:number}) {
  return <Link href={`/work/${project.slug}/`} className="project-card"><div className="card-top"><span className="tag">{project.category}</span><span className="index-label">{String(index+1).padStart(2,"0")}</span></div><p className="project-context">{project.context}</p><h3>{project.title}</h3><p className="project-summary">{project.summary}</p><div className="project-tags">{project.technologies.slice(0,3).map(item => <span key={item}>{item}</span>)}</div><div className="card-bottom"><span>{project.kind}</span><span className="card-link">Explore the work</span></div></Link>;
}
