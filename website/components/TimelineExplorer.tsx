"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { timeline } from "@/lib/content";
export function TimelineExplorer() {
 const [category,setCategory]=useState("All");
 const [order,setOrder]=useState("newest");
 const [jump,setJump]=useState("");
 const [expanded,setExpanded]=useState<Set<string>>(new Set());
 const items=useMemo(()=>timeline.filter(item=>category==="All"||item.category===category).slice().sort((a,b)=>order==="newest"?b.start-a.start:a.start-b.start),[category,order]);
 const years=Array.from(new Set(items.map(item=>Math.floor(item.start/100))));
 const allOpen=items.every(item=>expanded.has(item.id));
 function toggle(id:string){setExpanded(previous=>{const next=new Set(previous);if(next.has(id))next.delete(id);else next.add(id);return next;});}
 function toggleAll(){setExpanded(previous=>{const next=new Set(previous);items.forEach(item=>allOpen?next.delete(item.id):next.add(item.id));return next;});}
 function jumpTo(value:string){setJump(value);if(!value)return;const target=document.getElementById(`year-${value}`);if(target){target.focus({preventScroll:true});target.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});}}
 return <><div className="timeline-controls"><div className="filter-row" role="group" aria-label="Filter timeline">{["All","Work","Education","Certifications","Conference"].map(value=><button type="button" key={value} aria-pressed={category===value} onClick={()=>{setCategory(value);setJump("");}}>{value}</button>)}</div>
 <div className="timeline-options"><label>Order<select value={order} onChange={event=>{setOrder(event.target.value);setJump("");}}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label><label>Jump to year<select value={jump} onChange={event=>jumpTo(event.target.value)}><option value="">Choose a year</option>{years.map(year=><option key={year} value={year}>{year}</option>)}</select></label><button className="text-button" type="button" onClick={toggleAll}>{allOpen?"Collapse all":"Expand all"}</button></div></div>
 <p className="timeline-status" role="status" aria-live="polite">{items.length} {items.length===1?"event":"events"} · {order==="newest"?"Newest":"Oldest"} first. Events are grouped by the year they began.</p>
 <div className="timeline">{years.map(year=><section className="timeline-year" key={year} aria-labelledby={`year-${year}`}><h2 id={`year-${year}`} tabIndex={-1}>{year}</h2><div className="year-events">{items.filter(item=>Math.floor(item.start/100)===year).map(item=>{
 const open=expanded.has(item.id);
 return <article className="timeline-event" key={item.id}><p className="event-meta">{item.period}<span>{item.category}</span></p><h3>{item.title}</h3><p className="organisation">{item.organisation}</p><p>{item.summary}</p><button className="event-toggle" type="button" onClick={()=>toggle(item.id)} aria-expanded={open} aria-controls={`details-${item.id}`} aria-label={`${open?"Hide":"Read"} details: ${item.title}`}>{open?"Hide details":"Read details"}<span aria-hidden="true">{open?"−":"+"}</span></button><div id={`details-${item.id}`} hidden={!open} className="event-details">{item.details.map(text=><p key={text}>{text}</p>)}<Link className="text-link" href={item.href}>{item.linkLabel}</Link></div></article>;
 })}</div></section>)}</div></>;
}
