import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Shell } from "@/components/ui/Shell";
import { ProjectExplorer } from "@/components/ProjectExplorer";
export const metadata: Metadata = {title:"My work",description:"My professional experience and projects in AI, data, research and software development."};
export default function WorkPage() {
 return <><PageHero title="My work" description="The roles I’ve held and the projects I’ve worked on. Open an entry to read what I did and how the work came together."/><section className="page-content"><Shell><ProjectExplorer/></Shell></section></>;
}
