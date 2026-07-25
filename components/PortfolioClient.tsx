"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Mail,
  Menu,
  Moon,
  Phone,
  Sun,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { portfolio } from "@/data/portfolio";

const navigation = [
  { id: "about", label: "About" },
  { id: "focus", label: "Focus" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
] as const;

type Theme = "dark" | "light";

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");

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

  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;

  return (
    <button
      className={compact ? "icon-button" : "menu-secondary-action"}
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
      {!compact && <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>}
    </button>
  );
}

function Navigation() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
      { rootMargin: "-24% 0px -64%", threshold: [0, 0.15, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const opener = openerRef.current;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const overlay = overlayRef.current;
    const focusable = overlay
      ? Array.from(
          overlay.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        )
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const frame = requestAnimationFrame(() => first?.focus());

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      opener?.focus();
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="header-shell">
          <a className="brand" href="#home" aria-label="GS — Gramoz Shala, home">
            <span className="brand-mark" aria-hidden="true">
              GS
            </span>
            <span className="brand-name">Gramoz Shala</span>
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? "is-active" : undefined}
                aria-current={active === item.id ? "location" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <ThemeToggle compact />
            <a className="header-contact" href="#contact">
              Contact
              <ArrowDownRight aria-hidden="true" size={16} />
            </a>
            <button
              ref={openerRef}
              className="icon-button menu-button"
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Open navigation menu"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" size={20} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          ref={overlayRef}
          className="mobile-menu"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="mobile-menu-shell">
            <div className="mobile-menu-header">
              <a className="brand" href="#home" onClick={closeMenu}>
                <span className="brand-mark" aria-hidden="true">
                  GS
                </span>
                <span className="brand-name">Gramoz Shala</span>
              </a>
              <button
                className="icon-button"
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMenu}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>

            <nav className="mobile-menu-nav" aria-label="Mobile navigation">
              {navigation.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={active === item.id ? "is-active" : undefined}
                  aria-current={active === item.id ? "location" : undefined}
                  onClick={closeMenu}
                >
                  <span aria-hidden="true">0{index + 1}</span>
                  <strong>{item.label}</strong>
                  <ArrowRight aria-hidden="true" size={18} />
                </a>
              ))}
            </nav>

            <div className="mobile-menu-secondary">
              <ThemeToggle />
              <a
                className="menu-secondary-action"
                href={`mailto:${portfolio.contact.email}`}
                onClick={closeMenu}
              >
                <Mail aria-hidden="true" size={18} />
                <span>Email Gramoz</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
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
      <span aria-hidden="true">{number}</span>
      <p>{children}</p>
    </div>
  );
}

function CertificationArchive() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="certification-list">
      {portfolio.certifications.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `certification-panel-${index}`;
        const buttonId = `certification-button-${index}`;

        return (
          <article className={`certification-item${isOpen ? " is-open" : ""}`} key={item.name}>
            <button
              id={buttonId}
              className="certification-trigger"
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="certification-index" aria-hidden="true">
                0{index + 1}
              </span>
              <span className="certification-title">{item.name}</span>
              <ChevronDown className="certification-icon" aria-hidden="true" size={20} />
            </button>
            <div
              className="certification-panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
            >
              <div className="certification-panel-inner">
                <dl>
                  <div>
                    <dt>Issuer</dt>
                    <dd>{item.issuer}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{item.type}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </article>
        );
      })}
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

function ContactMethod({
  type,
  value,
  href,
}: {
  type: "Email" | "Phone";
  value: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const Icon = type === "Email" ? Mail : Phone;

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await copyText(value);
      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="contact-method">
      <div className="contact-method-label">
        <Icon aria-hidden="true" size={18} />
        <span>{type}</span>
      </div>
      <a href={href}>{value}</a>
      <button
        className="copy-button"
        type="button"
        onClick={copy}
        aria-label={`Copy ${type.toLowerCase()}`}
      >
        {copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
        <span>{copied ? "Copied" : `Copy ${type.toLowerCase()}`}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? `${type} copied` : ""}
      </span>
    </article>
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
          <div className="page-shell hero-layout">
            <div className="hero-heading">
              <p className="eyebrow">{portfolio.title}</p>
              <h1 id="hero-name">{portfolio.name}</h1>
              <h2>{portfolio.headline}</h2>
            </div>

            <figure className="hero-portrait">
              {/* Direct image delivery avoids a runtime optimizer dependency. */}
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
              <figcaption>
                <span>Electrical & Computer Engineering</span>
                <span>2021—Present</span>
              </figcaption>
            </figure>

            <div className="hero-support">
              <p>{portfolio.heroText}</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#about">
                  <span>Explore profile</span>
                  <ArrowDownRight aria-hidden="true" size={18} />
                </a>
                <a className="button button-secondary" href="#contact">
                  <span>Contact Gramoz</span>
                  <ArrowRight aria-hidden="true" size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section about-section" id="about" aria-labelledby="about-heading">
          <div className="page-shell">
            <SectionLabel number="01">About</SectionLabel>
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
        </section>

        <section className="section focus-section" id="focus" aria-labelledby="focus-heading">
          <div className="page-shell">
            <SectionLabel number="02">Focus</SectionLabel>
            <div className="section-intro">
              <h2 id="focus-heading">From physical signals to useful outcomes.</h2>
              <p>
                Six connected areas guide how Gramoz approaches technology,
                learning, and problem-solving.
              </p>
            </div>
            <div className="focus-grid">
              {portfolio.focusAreas.map((area, index) => (
                <article className="focus-item" key={area.title}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section experience-section"
          id="experience"
          aria-labelledby="experience-heading"
        >
          <div className="page-shell">
            <SectionLabel number="03">Experience</SectionLabel>
            <div className="section-intro">
              <h2 id="experience-heading">Initiative, communication, and practical experience.</h2>
              <p>
                A record shaped by building initiatives, presenting ideas, and
                working directly with people.
              </p>
            </div>
            <div className="experience-list">
              {portfolio.experience.map((item, index) => (
                <article className="experience-item" key={item.organization}>
                  <div className="experience-meta">
                    <span aria-hidden="true">0{index + 1}</span>
                    <time>{item.period}</time>
                  </div>
                  <div className="experience-title">
                    <p>{item.role}</p>
                    <h3>{item.organization}</h3>
                  </div>
                  <div className="experience-description">
                    <p>{item.summary}</p>
                    <ul>
                      {item.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section skills-section" id="skills" aria-labelledby="skills-heading">
          <div className="page-shell">
            <SectionLabel number="04">Skills</SectionLabel>
            <div className="section-intro">
              <h2 id="skills-heading">Capabilities developed beyond the lab.</h2>
              <p>
                Communication, organization, and creative skills that support
                technical work.
              </p>
            </div>
            <div className="skills-grid">
              {portfolio.skills.map((group, index) => (
                <article className="skill-group" key={group.category}>
                  <span aria-hidden="true">0{index + 1}</span>
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
            <SectionLabel number="05">Certifications</SectionLabel>
            <div className="certifications-grid">
              <div className="section-intro">
                <h2 id="certifications-heading">Learning beyond the lecture hall.</h2>
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
            <SectionLabel number="06">Contact</SectionLabel>
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
