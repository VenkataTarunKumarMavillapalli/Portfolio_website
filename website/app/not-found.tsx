import Link from "next/link";
import { Shell } from "@/components/ui/Shell";
export default function NotFound(){return <section className="page-content"><Shell className="reading empty-state"><p className="eyebrow">404</p><h1>This page isn’t here.</h1><p>You can return to the home page or look through my work.</p><div className="actions"><Link href="/" className="button primary">Home</Link><Link href="/work/" className="button secondary">My work</Link></div></Shell></section>;}
