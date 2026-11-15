"use client";
import { useMemo, useState } from "react";
import { work } from "@/lib/content";
import { ProjectCard } from "./ui/ProjectCard";
export function ProjectExplorer() {
 const [kind,setKind]=useState<"Experience" | "Project">("Experience");
 const [query,setQuery]=useState("");
 const items=useMemo(()=>work.filter(item=>item.kind===kind && `${item.title} ${item.organisation} ${item.role} ${item.summary} ${item.tools.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())),[kind,query]);
 function reset(){setQuery("");}
 return <><div className="work-controls"><div className="segmented" role="group" aria-label="Choose work collection">{(["Experience","Project"] as const).map(value=><button key={value} type="button" aria-pressed={kind===value} onClick={()=>{setKind(value);setQuery("");}}>{value==="Experience"?"Experience":"Projects"}<span aria-hidden="true">{work.filter(item=>item.kind===value).length}</span></button>)}</div>
 <div className="search-field"><label htmlFor="work-search">Search {kind==="Experience"?"experience":"projects"}</label><input id="work-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="A role, topic or tool"/></div></div>
 <div className="collection-status"><p role="status" aria-live="polite">{items.length} {kind==="Experience"?(items.length===1?"role":"roles"):(items.length===1?"project":"projects")}{query.trim()?` matching “${query.trim()}”`:""}</p>{query&&<button className="text-button" onClick={reset}>Clear search</button>}</div>
 {items.length?<div className="work-list">{items.map(item=><ProjectCard key={item.slug} item={item}/>)}</div>:<div className="empty-state"><h2>No matches here.</h2><p>Try another word or clear your search.</p><button className="button secondary" onClick={reset}>Clear search</button></div>}</>;
}
