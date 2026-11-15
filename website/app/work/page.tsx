import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Shell } from "@/components/ui/Shell";
import { ProjectExplorer } from "@/components/ProjectExplorer";
export const metadata:Metadata={title:"My work",description:"Explore projects in AI, analytics, research, machine learning, and digital products."};
export default function WorkPage(){return <><PageHero label="My work" title={<>Different problems.<br/>A practical approach.</>} description="A collection of professional contributions, research, and learning projects. Explore the context, my role, and the work behind each one."/><section className="section"><Shell><ProjectExplorer/></Shell></section></>;}
