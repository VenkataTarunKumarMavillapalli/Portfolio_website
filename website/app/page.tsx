import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Shell } from "@/components/ui/Shell";
import { assetPath } from "@/lib/paths";
import { profile } from "@/lib/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: {
    absolute: `${profile.name} | Enterprise AI Engineer & AI Solutions Architect`,
  },
  description:
    "Enterprise AI engineering with Microsoft Foundry, Azure AI Search, agentic AI and RAG. A personal portfolio focused on evaluation, security and responsible deployment.",
};

export default function HomePage() {
  return (
    <section className={`home ${styles.homepage}`} aria-labelledby="home-headline">
      <Shell>
        <div className={`home-layout ${styles.layout}`}>
          <div className={`home-copy ${styles.copy}`}>
            <p className={styles.name}>{profile.name}</p>
            <p className={styles.role}>Enterprise AI Engineer &amp; AI Solutions Architect</p>

            <h1 id="home-headline" className={styles.headline}>
              Building secure, production-ready AI agents with <span>Microsoft Foundry</span>,{" "}
              <span>Azure AI Search</span>, and the Microsoft AI ecosystem.
            </h1>

            <p className={`home-intro ${styles.intro}`}>
              I design and develop enterprise AI systems that connect advanced language models
              with organizational knowledge, tools, and workflows—focusing on agentic AI, RAG,
              evaluation, security, and responsible deployment.
            </p>

            <div className={styles.credentials} aria-label="Experience and credentials">
              <p className={styles.appointment}>
                AI Integration Consultant — UN World Food Programme
                <span>Investigative Technologies · Office of Inspector General · Jul 2026–present</span>
              </p>
              <ul>
                <li>Microsoft Certified: Azure AI Engineer Associate</li>
                <li>MSc Data Science</li>
              </ul>
            </div>

            <div className="actions">
              <Link href="/work/" className="button primary">Explore My Work</Link>
              <a href={profile.github} className="button secondary" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>

          <div className="home-portrait">
            <Image src={assetPath("/portrait.png")} alt={profile.name} width={211} height={210} priority/>
            <p>{profile.name}</p>
          </div>
        </div>

        <section className={styles.expertise} aria-label="Areas of expertise">
          <div>
            <h2>AI Agents &amp; Orchestration</h2>
            <p>Microsoft Foundry, tool integration, agentic workflows.</p>
          </div>
          <div>
            <h2>Enterprise Knowledge &amp; RAG</h2>
            <p>Azure AI Search, retrieval, grounding, knowledge systems.</p>
          </div>
          <div>
            <h2>Trusted Production AI</h2>
            <p>Evaluation, security, observability, and governance.</p>
          </div>
        </section>
      </Shell>
    </section>
  );
}
