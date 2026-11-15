import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Shell } from "@/components/ui/Shell";
import { TimelineExplorer } from "@/components/TimelineExplorer";
export const metadata:Metadata={title:"My journey",description:"Education, professional experience, and milestones from 2016 onward."};
export default function JourneyPage(){return <><PageHero label="My journey" title={<>A path shaped<br/>by learning.</>} description="The experiences, places, and people that have shaped how I think and what I build."/><section className="section"><Shell><div className="journey-intro"><span className="eyebrow">2016 — 2026</span><p>Computing opened the door. International study, research, and hands-on delivery have kept expanding the view.</p></div><TimelineExplorer/></Shell></section></>;}
