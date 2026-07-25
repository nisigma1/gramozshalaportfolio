"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { portfolio } from "@/data/portfolio";

const navigation = [
  { id: "about", label: "About" },
  { id: "focus", label: "Focus" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current =
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const frame = requestAnimationFrame(() => setTheme(current));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("gramoz-theme", next);
    setTheme(next);
  };

  return (
    <button
      className="icon-button theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <span aria-hidden="true">{theme === "dark" ? "◐" : "◑"}</span>
    </button>
  );
}

function Navigation() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = ["home", ...navigation.map((item) => item.id)]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65%", threshold: [0, 0.2, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="nav-shell">
        <a className="brand" href="#home" aria-label="Gramoz Shala, home">
          <span className="brand-mark" aria-hidden="true">
            GS
          </span>
          <span className="brand-name">Gramoz Shala</span>
        </a>

        <nav className={`main-nav${open ? " is-open" : ""}`} aria-label="Main navigation">
          <div className="nav-links">
            {navigation.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? "active" : undefined}
                aria-current={active === item.id ? "location" : undefined}
                onClick={() => setOpen(false)}
              >
                <span aria-hidden="true">0{index + 1}</span>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="nav-actions">
          <ThemeToggle />
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true">{open ? "×" : "≡"}</span>
          </button>
        </div>
      </div>
      <div id="mobile-navigation" className={`mobile-nav-panel${open ? " is-open" : ""}`}>
        {navigation.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? "active" : undefined}
            aria-current={active === item.id ? "location" : undefined}
            onClick={() => setOpen(false)}
          >
            <span>0{index + 1}</span>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <p>{children}</p>
    </div>
  );
}

function Metric({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 900;
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="metric" ref={ref}>
      <p className="metric-value">
        {display.toLocaleString("en-US")}
        {suffix}
      </p>
      <p>{label}</p>
    </div>
  );
}

function ExperienceTimeline() {
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const moveSelection = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = index + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = portfolio.experience.length - 1;
    else return;
    event.preventDefault();
    const normalized =
      (next + portfolio.experience.length) % portfolio.experience.length;
    setActive(normalized);
    buttons.current[normalized]?.focus();
  };

  const selected = portfolio.experience[active];

  return (
    <div className="experience-layout">
      <div className="timeline-controls" role="tablist" aria-label="Work experience">
        {portfolio.experience.map((item, index) => (
          <button
            key={item.organization}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            id={`experience-tab-${index}`}
            role="tab"
            type="button"
            aria-selected={active === index}
            aria-controls={`experience-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            className={active === index ? "active" : undefined}
            onClick={() => setActive(index)}
            onKeyDown={(event) => moveSelection(event, index)}
          >
            <span className="timeline-period">{item.period}</span>
            <span className="timeline-name">{item.organization}</span>
            <span className="timeline-node" aria-hidden="true" />
          </button>
        ))}
      </div>

      <article
        className="experience-panel"
        id={`experience-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`experience-tab-${active}`}
        tabIndex={0}
      >
        <div className="panel-index" aria-hidden="true">
          /0{active + 1}
        </div>
        <p className="eyebrow">{selected.role}</p>
        <h3>{selected.organization}</h3>
        <p className="panel-summary">{selected.summary}</p>
        <ul>
          {selected.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}

async function copyText(value: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  const [status, setStatus] = useState("");

  const copy = async () => {
    try {
      await copyText(value);
      setStatus(`${label} copied`);
    } catch {
      setStatus(`Could not copy ${label.toLowerCase()}`);
    }
    window.setTimeout(() => setStatus(""), 2200);
  };

  return (
    <div className="contact-row">
      <p>{label}</p>
      <a href={href}>{value}</a>
      <button type="button" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
        Copy
      </button>
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
      {status && (
        <span className="copy-status" aria-hidden="true">
          {status}
        </span>
      )}
    </div>
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
    ],
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navigation />

      <main id="main-content">
        <section className="hero" id="home" aria-labelledby="hero-heading">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-shell">
            <div className="hero-kicker">
              <span>Electrical & Computer Engineering</span>
              <span>Prishtina · 42.66° N</span>
            </div>

            <div className="portrait-frame">
              {/* Source is already compressed; direct delivery avoids a runtime optimizer dependency. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/gramoz-shala.jpg"
                alt="Portrait of Gramoz Shala wearing a black turtleneck"
                width={1024}
                height={1024}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="portrait-calibration" aria-hidden="true">
                <span>01</span>
                <span>FOCUS / SYSTEMS</span>
              </div>
            </div>

            <div className="hero-copy">
              <p className="eyebrow">{portfolio.title}</p>
              <h1 id="hero-heading">{portfolio.headline}</h1>
              <p className="hero-intro">{portfolio.heroText}</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#experience">
                  Explore my work <span aria-hidden="true">↘</span>
                </a>
                <a className="button button-secondary" href="#contact">
                  Contact me
                </a>
              </div>
            </div>

            <div className="hero-name" aria-hidden="true">
              <span>Gramoz</span>
              <span>Shala</span>
            </div>

            <a className="scroll-cue" href="#about">
              <span>Scroll to explore</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <section className="section about-section" id="about" aria-labelledby="about-heading">
          <div className="section-shell">
            <SectionLabel number="01">About</SectionLabel>
            <div className="about-layout">
              <h2 id="about-heading">
                Curiosity is useful when it becomes a way to understand, test, and build.
              </h2>
              <div className="about-copy">
                <p>{portfolio.about.intro}</p>
                <p>{portfolio.about.philosophy}</p>
              </div>
              <div className="about-facts" aria-label="Quick facts">
                <p>
                  <span>Study</span>
                  Electrical & Computer Engineering
                </p>
                <p>
                  <span>Focus</span>
                  Electronics / Automation / Robotics
                </p>
                <p>
                  <span>Perspective</span>
                  Technical thinking with practical impact
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section focus-section" id="focus" aria-labelledby="focus-heading">
          <div className="section-shell">
            <SectionLabel number="02">Engineering focus</SectionLabel>
            <div className="section-heading-row">
              <h2 id="focus-heading">One connected system, six areas of inquiry.</h2>
              <p>
                Each area strengthens the next: from physical signals and hardware
                to control, action, and useful outcomes.
              </p>
            </div>

            <ol className="signal-system">
              {portfolio.focusAreas.map((area, index) => (
                <li key={area.title}>
                  <span className="signal-index">0{index + 1}</span>
                  <span className="signal-node" aria-hidden="true" />
                  <div>
                    <h3>{area.title}</h3>
                    <p>{area.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section education-section" aria-labelledby="education-heading">
          <div className="section-shell">
            <SectionLabel number="03">Education</SectionLabel>
            <div className="education-track">
              <div className="education-status">
                <span className="status-dot" aria-hidden="true" />
                In progress
              </div>
              <p className="education-period">{portfolio.education.period}</p>
              <div>
                <h2 id="education-heading">{portfolio.education.institution}</h2>
                <p>{portfolio.education.program}</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section experience-section"
          id="experience"
          aria-labelledby="experience-heading"
        >
          <div className="section-shell">
            <SectionLabel number="04">Experience</SectionLabel>
            <div className="section-heading-row">
              <h2 id="experience-heading">Experience shaped by initiative and communication.</h2>
              <p>
                Work across student initiatives, digital communication, and
                customer-facing electronics.
              </p>
            </div>
            <ExperienceTimeline />
          </div>
        </section>

        <section className="metrics-section" aria-label="Selected impact">
          <div className="section-shell metrics-grid">
            {portfolio.metrics.map((metric) => (
              <Metric key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <section className="section skills-section" id="skills" aria-labelledby="skills-heading">
          <div className="section-shell">
            <SectionLabel number="05">Capabilities</SectionLabel>
            <div className="skills-layout">
              <h2 id="skills-heading">Skills that support the work.</h2>
              <div className="skills-matrix">
                {portfolio.skills.map((group, index) => (
                  <div className="skill-group" key={group.category}>
                    <p className="skill-number">0{index + 1}</p>
                    <h3>{group.category}</h3>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="section certification-section"
          id="certifications"
          aria-labelledby="certifications-heading"
        >
          <div className="section-shell">
            <SectionLabel number="06">Certifications & recognition</SectionLabel>
            <div className="certification-layout">
              <div>
                <h2 id="certifications-heading">Learning beyond the lecture hall.</h2>
                <p>
                  Training in entrepreneurship, communication, inclusion, and
                  critical thinking—alongside recognition for volunteering.
                </p>
              </div>
              <div className="certification-list">
                {portfolio.certifications.map((item, index) => (
                  <details key={item.name}>
                    <summary>
                      <span className="cert-index">0{index + 1}</span>
                      <span>{item.name}</span>
                      <span className="summary-mark" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <div className="cert-details">
                      <p>
                        <span>Issuer</span>
                        {item.issuer}
                      </p>
                      <p>
                        <span>Type</span>
                        {item.type}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="languages-section" aria-labelledby="languages-heading">
          <div className="section-shell languages-layout">
            <h2 id="languages-heading">Languages</h2>
            {portfolio.languages.map((item) => (
              <div key={item.language}>
                <p>{item.language}</p>
                <span>{item.proficiency}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-heading">
          <div className="contact-grid" aria-hidden="true" />
          <div className="section-shell contact-layout">
            <SectionLabel number="07">Contact</SectionLabel>
            <h2 id="contact-heading">Let&apos;s build something meaningful.</h2>
            <p className="contact-intro">
              Open to conversations around engineering, technology, innovation,
              collaboration, and new opportunities.
            </p>
            <div className="contact-list">
              <ContactRow
                label="Email"
                value={portfolio.contact.email}
                href={`mailto:${portfolio.contact.email}`}
              />
              <ContactRow
                label="Phone"
                value={portfolio.contact.phoneDisplay}
                href={`tel:${portfolio.contact.phoneHref}`}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-shell footer-layout">
          <p>
            <span>{portfolio.name}</span>
            Electronics, Automation & Robotics · <time dateTime={`${year}`}>{year}</time>
          </p>
          <a href="#home">
            Back to top <span aria-hidden="true">↑</span>
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
