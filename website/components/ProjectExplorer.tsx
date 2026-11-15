"use client";

import { useMemo, useState } from "react";
import { projects } from "@/lib/content";
import { ProjectCard } from "./ui/ProjectCard";

export function ProjectExplorer() {
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All work");
  const [kind,setKind]=useState("All contexts");
  const categories=["All work","AI & automation","Data & analytics","Research & ML","Digital products"];
  const kinds=["All contexts",...Array.from(new Set(projects.map(p=>p.kind)))];
  const filtered=useMemo(()=>projects.filter(p=>(category==="All work"||p.category===category)&&(kind==="All contexts"||p.kind===kind)&&`${p.title} ${p.summary} ${p.context} ${p.technologies.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())),[query,category,kind]);
  function reset(){setQuery("");setCategory("All work");setKind("All contexts");}
  return <><div className="explorer-toolbar"><div className="search-field"><label htmlFor="project-search">Find something that interests you</label><input id="project-search" value={query} onChange={e=>setQuery(e.target.value)} type="search" placeholder="Search projects, topics, or technologies…" /></div><div className="select-field"><label htmlFor="project-kind">Context</label><select id="project-kind" value={kind} onChange={e=>setKind(e.target.value)}>{kinds.map(k=><option key={k}>{k}</option>)}</select></div></div><div className="filter-row" role="group" aria-label="Filter projects by area">{categories.map(c=><button type="button" key={c} className={category===c?"filter active":"filter"} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="collection-status"><p role="status" aria-live="polite">{filtered.length} {filtered.length===1?"project":"projects"}{query?` matching “${query}”`:" to explore"}</p>{(query||category!=="All work"||kind!=="All contexts")&&<button onClick={reset} className="text-button">Clear filters ↺</button>}</div>{filtered.length?<div className="project-grid">{filtered.map(p=><ProjectCard key={p.slug} project={p} index={projects.indexOf(p)}/>)}</div>:<div className="empty-state"><h2>No projects found.</h2><p>Try a different topic or clear the filters to explore the full collection.</p><button onClick={reset} className="button primary">Show all projects</button></div>}</>;
}
