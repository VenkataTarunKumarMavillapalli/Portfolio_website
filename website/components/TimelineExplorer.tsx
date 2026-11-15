"use client";

import { useState } from "react";
import { timeline } from "@/lib/content";

export function TimelineExplorer() {
  const [category,setCategory]=useState("Everything");
  const [direction,setDirection]=useState("recent");
  const items=timeline.filter(t=>category==="Everything"||t.category===category).slice().sort((a,b)=>direction==="recent"?b.year-a.year:a.year-b.year);
  return <><div className="timeline-toolbar"><div className="filter-row" role="group" aria-label="Filter journey">{["Everything","Experience","Education","Milestone"].map(c=><button key={c} className={category===c?"filter active":"filter"} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c==="Milestone"?"Milestones":c}</button>)}</div><label className="sort-label">Read from<select value={direction} onChange={e=>setDirection(e.target.value)}><option value="recent">Most recent</option><option value="beginning">The beginning</option></select></label></div><p className="sr-only" role="status">{items.length} journey entries</p><div className="timeline">{items.map(item=><article className="timeline-entry" key={item.id}><div className="timeline-date"><span>{item.period}</span><small>{item.location}</small></div><div className="timeline-content"><span className="timeline-dot" aria-hidden="true"/><span className="eyebrow">{item.category}</span><h2>{item.title}</h2><p className="organisation">{item.organisation}</p><p>{item.summary}</p>{item.details.length>0&&<details><summary>More about this chapter <span aria-hidden="true">+</span></summary><ul>{item.details.map(detail=><li key={detail}>{detail}</li>)}</ul></details>}</div></article>)}</div></>;
}
