import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Shell } from "@/components/ui/Shell";
import { profile } from "@/lib/content";

export const metadata: Metadata = {
  title: "About me",
  description: `${profile.name} is a Data Science and AI professional with international experience at the United Nations World Food Programme and the European Food Safety Authority.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHero title="About me" description={`${profile.name} — Data Science and AI professional.`}/>
      <section className="page-content">
        <Shell className="reading">
          <div className="prose-section">
            <h2>Professional background</h2>
            <p>
              {profile.name} is a Data Science and AI professional with international
              experience at the World Food Programme (WFP), a United Nations agency,
              and the European Food Safety Authority (EFSA), a European Union agency.
            </p>
            <p>
              He holds a master’s degree in Data Science and a bachelor’s degree in
              Computer Science. His academic, professional and international experiences
              have taken him through London, New York, Delhi, Naples (Napoli), Parma,
              Rome and Singapore.
            </p>
            <p>
              He has worked with global teams on data and AI projects at WFP and gained
              hands-on experience in data engineering at EFSA. He is a proud graduate of
              the Apple Developer Academy in Europe and a Microsoft Certified Azure AI Engineer.
            </p>
            <Link className="text-link" href="/timeline/">Follow the timeline</Link>
          </div>

          <div className="prose-section">
            <h2>Work and approach</h2>
            <p>
              He is passionate about using data, AI and cloud technologies to solve
              business challenges, deliver measurable results and support evidence-based
              decision-making. He believes in building solutions that improve efficiency,
              transparency and impact for teams.
            </p>
            <p>
              His AI engineering work includes systems that find information in documents,
              connect models to tools, and help people draft or review material. Much of
              this work uses Azure services, with attention to source references, access
              controls, monitoring and human review.
            </p>
            <p>
              His data work includes dashboards, validation rules and pipelines that help
              teams check information and understand their operations. He has also automated
              reporting refreshes, ticket updates and approval workflows, alongside writing
              documentation, testing changes and preparing handovers.
            </p>
            <p>
              He brings together innovation, collaboration and purpose, with the aim of
              creating meaningful change that makes a difference.
            </p>
            <Link className="text-link" href="/work/">Read about his work</Link>
          </div>

          <div className="prose-section" id="outside-work">
            <h2>Outside work</h2>
            <p>
              During university, he was a member of the Computer Society of India and the
              Sports Club. He took part in Sangathan sports events, earning a bronze medal
              in chess and a gold medal in carrom, and also played cricket.
            </p>
            <p>
              He volunteered as an escort for international guests at Confluence 2017 and
              served as Assistant Head for Organising and Management at Amity Youth Fest.
              These were part of his university life alongside the academic programme.
            </p>
          </div>

          <div className="prose-section">
            <h2>Let’s connect</h2>
            <p>Let’s explore how we can create value through data and innovation.</p>
            <Link className="text-link" href="/contact/">Get in touch</Link>
          </div>
        </Shell>
      </section>
    </>
  );
}
