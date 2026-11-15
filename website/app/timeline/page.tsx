import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Shell } from "@/components/ui/Shell";
import { TimelineExplorer } from "@/components/TimelineExplorer";
export const metadata: Metadata = {title:"My timeline",description:"Explore my education, work and learning from 2016 to 2026. Filter by type, change the order and open each event."};
export default function TimelinePage() {
 return <><PageHero title="My timeline" description="My studies, work and learning from 2016 to 2026. Choose a category, jump to a year, or open an event to read more."/><section className="page-content"><Shell><TimelineExplorer/></Shell></section></>;
}
