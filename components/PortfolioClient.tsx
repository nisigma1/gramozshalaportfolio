import {
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  CertificationArchive,
  ContactMethod,
  ExperienceTimeline,
  ImpactMetrics,
  Navigation,
} from "@/components/PortfolioInteractions";
import { ParticleTypography } from "@/components/ParticleTypography";
import { CursorGrid } from "@/components/CursorGrid";
import { DotGrid } from "@/components/DotGrid";
import { portfolio } from "@/data/portfolio";

function SectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="section-label">
      <p>{children}</p>
    </div>
  );
}

function FocusSystem() {
  const stages = [
    { label: "Sense", areas: portfolio.focusAreas.slice(0, 2) },
    { label: "Control", areas: portfolio.focusAreas.slice(2, 4) },
    { label: "Apply", areas: portfolio.focusAreas.slice(4, 6) },
  ] as const;

  return (
    <ol
      className="focus-ledger"
      aria-label="Engineering focus signal path"
    >
      {stages.map((stage, stageIndex) => (
        <li className="focus-stage-row" key={stage.label}>
          <div className="focus-stage-heading">
            <span>0{stageIndex + 1}</span>
            <h3>{stage.label}</h3>
          </div>
          {stage.areas.map((area) => (
            <article className="focus-area" key={area.title}>
              <h4>{area.title}</h4>
              <p>{area.description}</p>
            </article>
          ))}
        </li>
      ))}
    </ol>
  );
}

function MaleraSection() {
  return (
    <section className="malera-section" id="malera" aria-labelledby="malera-heading">
      <div className="page-shell">
        <div className="malera-heading-row">
          <SectionLabel>{portfolio.studio.eyebrow}</SectionLabel>
          <span className="malera-index" aria-hidden="true">04</span>
        </div>
        <div className="malera-layout">
          <div className="malera-copy">
            <p className="malera-kicker">Malera Studio</p>
            <h2 id="malera-heading">{portfolio.studio.headline}</h2>
            <p className="malera-description">{portfolio.studio.description}</p>
            <a
              className="button button-primary malera-cta"
              href={portfolio.studio.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${portfolio.studio.name}, opens in a new tab`}
            >
              Visit Malera Studio
              <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.8} />
            </a>
          </div>
          <div className="malera-services" aria-label="Malera Studio services">
            <div className="malera-signal-stage">
              <CursorGrid cellSize={58} radius={142} />
              <div className="malera-signal-content">
                <ParticleTypography text="MALERA" />
                <span>Move through the system</span>
              </div>
            </div>
            <p className="malera-services-label">What the studio makes</p>
            <ul>
              {portfolio.studio.services.map((service, index) => (
                <li key={service}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <strong>{service}</strong>
                  <ArrowRight aria-hidden="true" size={16} strokeWidth={1.7} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PortfolioClient() {
  const year = new Date().getFullYear();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: portfolio.name,
    jobTitle: portfolio.title,
    email: `mailto:${portfolio.contact.email}`,
    telephone: portfolio.contact.phoneHref,
    knowsAbout: [
      "Electronics",
      "Automation",
      "Robotics",
      "Sensors",
      "Hardware",
      "Technology and innovation",
    ],
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navigation />

      <main id="main-content">
        <section className="hero" id="home" aria-labelledby="hero-name">
          <div className="page-shell hero-composition">
            <div className="hero-overline">
              <p className="eyebrow">{portfolio.title}</p>
              <p>Engineering studies since 2021</p>
            </div>

            <h1 id="hero-name">
              <span>Gramoz</span>
              <span>Shala</span>
            </h1>

            <div className="hero-stage">
              <figure className="hero-portrait">
                {/* Direct image delivery avoids a runtime optimizer dependency. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/gramoz-shala-clean.png"
                  alt="Portrait of Gramoz Shala wearing a black turtleneck"
                  width={1126}
                  height={1126}
                  loading="eager"
                  fetchPriority="auto"
                  decoding="async"
                />
                <figcaption>
                  <span>Electrical & Computer Engineering</span>
                  <span>2021—Present</span>
                </figcaption>
              </figure>

              <div className="hero-thesis">
                <p className="hero-thesis-label">Engineered with purpose</p>
                <h2>{portfolio.headline}</h2>
                <p>{portfolio.heroText}</p>
                <div className="hero-actions">
                  <a className="button button-primary" href="#about">
                    <span>Explore my work</span>
                    <ArrowDownRight aria-hidden="true" size={18} />
                  </a>
                  <a className="button button-secondary" href="#contact">
                    <span>Contact me</span>
                    <ArrowRight aria-hidden="true" size={18} />
                  </a>
                </div>
              </div>
            </div>

            <a className="hero-scroll" href="#about">
              <span>Scroll to explore</span>
              <ArrowDownRight aria-hidden="true" size={17} />
            </a>
          </div>
        </section>

        <section className="section about-section" id="about" aria-labelledby="about-heading">
          <div className="page-shell">
            <SectionLabel>About</SectionLabel>
            <div className="about-grid">
              <div className="about-heading">
                <p className="eyebrow">A systems perspective</p>
                <h2 id="about-heading">{portfolio.about.statement}</h2>
              </div>
              <div className="about-copy">
                <p>{portfolio.about.intro}</p>
                <p>{portfolio.about.perspective}</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section education-section"
          id="education"
          aria-labelledby="education-heading"
        >
          <div className="page-shell">
            <SectionLabel>Education</SectionLabel>
            <div className="education-visual">
              <DotGrid />
              <div className="education-block" aria-labelledby="education-heading">
              <div className="education-status">
                <span className="status-dot" aria-hidden="true" />
                Current education
              </div>
              <p>{portfolio.education.period}</p>
              <div>
                <h3 id="education-heading">{portfolio.education.institution}</h3>
                <p>{portfolio.education.program}</p>
              </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section focus-section" id="focus" aria-labelledby="focus-heading">
          <div className="page-shell">
            <SectionLabel>Engineering focus</SectionLabel>
            <div className="section-intro">
              <h2 id="focus-heading">From physical signals to useful outcomes.</h2>
              <p>
                Six connected areas guide how Gramoz approaches technology,
                learning, and problem-solving.
              </p>
            </div>
            <FocusSystem />
          </div>
        </section>

        <section
          className="section experience-section"
          id="experience"
          aria-labelledby="experience-heading"
        >
          <div className="page-shell">
            <SectionLabel>Experience</SectionLabel>
            <div className="section-intro">
              <h2 id="experience-heading">Initiative, communication, and practical experience.</h2>
              <p>
                A record shaped by building initiatives, presenting ideas, and
                working directly with people.
              </p>
            </div>
            <ExperienceTimeline />
          </div>
        </section>

        <MaleraSection />

        <ImpactMetrics />

        <section className="section skills-section" id="skills" aria-labelledby="skills-heading">
          <div className="page-shell">
            <SectionLabel>Skills</SectionLabel>
            <div className="section-intro">
              <h2 id="skills-heading">Capabilities developed beyond the lab.</h2>
              <p>
                Communication, organization, and creative skills that support
                technical work.
              </p>
            </div>
            <div className="skills-grid">
              {portfolio.skills.map((group) => (
                <article className="skill-group" key={group.category}>
                  <h3>{group.category}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="languages-section" aria-labelledby="languages-heading">
          <div className="page-shell languages-grid">
            <div>
              <p className="eyebrow">Languages</p>
              <h2 id="languages-heading">Clear across contexts.</h2>
            </div>
            <dl>
              {portfolio.languages.map((item) => (
                <div key={item.language}>
                  <dt>{item.language}</dt>
                  <dd>{item.proficiency}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section
          className="section certifications-section"
          id="certifications"
          aria-labelledby="certifications-heading"
        >
          <div className="page-shell">
            <SectionLabel>Archive</SectionLabel>
            <div className="certifications-grid">
              <div className="section-intro">
                <h2 id="certifications-heading">Certifications & Recognition.</h2>
                <p>
                  Training across entrepreneurship, communication, inclusion,
                  and critical thinking, alongside recognition for volunteering.
                </p>
              </div>
              <CertificationArchive />
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-heading">
          <div className="page-shell">
            <SectionLabel>Contact</SectionLabel>
            <div className="contact-heading">
              <h2 id="contact-heading">Let&apos;s build something meaningful.</h2>
              <p>
                Open to conversations around engineering, technology, innovation,
                collaboration, and new opportunities.
              </p>
            </div>
            <div className="contact-list">
              <ContactMethod
                type="Email"
                value={portfolio.contact.email}
                href={`mailto:${portfolio.contact.email}`}
              />
              <ContactMethod
                type="Phone"
                value={portfolio.contact.phoneDisplay}
                href={`tel:${portfolio.contact.phoneHref}`}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-shell footer-grid">
          <div>
            <p>{portfolio.name}</p>
            <span>Electronics, Automation & Robotics</span>
          </div>
          <p>
            <time dateTime={`${year}`}>{year}</time>
          </p>
          <a href="#home">
            <span>Back to top</span>
            <ArrowUp aria-hidden="true" size={17} />
          </a>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
