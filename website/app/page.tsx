import Link from "next/link";
import Image from "next/image";
import { Shell } from "@/components/ui/Shell";
import { assetPath } from "@/lib/paths";
export default function HomePage() {
  return <section className="home"><Shell><div className="home-layout">
    <div className="home-copy"><p className="eyebrow">AI engineer & data professional</p><h1>Hi, I’m<br/><span>Venkata Tarun.</span></h1>
      <p className="home-intro">I work with AI, data and automation. I’ve built tools for teams at the World Food Programme and EFSA, and worked in research and enterprise software.</p>
      <div className="actions"><Link href="/work/" className="button primary">Explore my work</Link><Link href="/timeline/" className="button secondary">View my timeline</Link></div>
      <p className="home-more">Want to know a little more? <Link href="/about/">Read about me</Link>.</p>
    </div><div className="home-portrait"><Image src={assetPath("/portrait.png")} alt="Venkata Tarun Kumar Mavillapalli" width={211} height={210} priority/><p>Venkata Tarun Kumar Mavillapalli</p></div>
  </div></Shell></section>;
}
