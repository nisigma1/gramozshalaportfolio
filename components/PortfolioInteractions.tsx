"use client";

import {
  ArrowDownRight,
  ArrowRight,
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
import { type MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { portfolio } from "@/data/portfolio";

const navigation = [
  { id: "about", label: "About" },
  { id: "focus", label: "Focus" },
  { id: "experience", label: "Experience" },
  { id: "malera", label: "Malera Studio" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
] as const;

type Theme = "dark" | "light";

function navigateToSection(hash: string) {
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  // A fragment is a scroll action, not a new server-component route.
  // Use the native History method so the router does not replace the page.
  if (location.hash !== hash) History.prototype.pushState.call(window.history, null, "", hash);
  target.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

export function SkipLink() {
  return (
    <a className="skip-link" href="#main-content" onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      const main = document.getElementById("main-content");
      main?.focus({ preventScroll: true });
      main?.scrollIntoView({ block: "start" });
    }}>
      Skip to content
    </a>
  );
}

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const syncTheme = () => setTheme(
      document.documentElement.dataset.theme === "light" ? "light" : "dark",
    );
    const frame = requestAnimationFrame(syncTheme);
    window.addEventListener("portfolio-theme-change", syncTheme);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("portfolio-theme-change", syncTheme);
    };
  }, []);

  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("gramoz-theme", next);
    } catch {
      // The theme remains usable when browser storage is unavailable.
    }
    setTheme(next);
    window.dispatchEvent(new Event("portfolio-theme-change"));
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

export function Navigation() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pendingHashRef = useRef<string | null>(null);

  useEffect(() => {
    const sections = ["home", ...navigation.map((item) => item.id)]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    let frame = 0;
    const update = () => {
      frame = 0;
      if (document.body.style.position === "fixed") return;
      setScrolled(window.scrollY > 12);
      const offset = (document.querySelector("header")?.getBoundingClientRect().height ?? 72) + 32;
      const current = sections.filter((section) => section.getBoundingClientRect().top <= offset).at(-1);
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      setActive(atEnd ? "contact" : current?.id ?? "home");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const onAnchorClick = (event: globalThis.MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!anchor || anchor.closest(".mobile-menu") || anchor.classList.contains("skip-link")) return;
      if (!document.getElementById(anchor.hash.slice(1))) return;
      event.preventDefault();
      event.stopPropagation();
      navigateToSection(anchor.hash);
    };
    document.addEventListener("click", onAnchorClick, true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("click", onAnchorClick, true);
      cancelAnimationFrame(frame);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const body = document.body;
    const opener = openerRef.current;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollY = window.scrollY;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousWidth = body.style.width;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    const background = Array.from(document.querySelectorAll<HTMLElement>("header, main, .site-footer, .skip-link"))
      .map((element) => ({ element, inert: element.inert }));
    background.forEach(({ element }) => { element.inert = true; });

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
    const frame = requestAnimationFrame(() => first?.focus({ preventScroll: true }));
    const desktop = window.matchMedia("(min-width: 80rem)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", onResize);

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
      desktop.removeEventListener("change", onResize);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.width = previousWidth;
      background.forEach(({ element, inert }) => { element.inert = inert; });
      window.scrollTo({ top: scrollY, behavior: "instant" });
      opener?.focus({ preventScroll: true });
      const hash = pendingHashRef.current;
      pendingHashRef.current = null;
      if (hash) {
        navigateToSection(hash);
      }
    };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const selectSection = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    pendingHashRef.current = event.currentTarget.hash;
    setOpen(false);
  };

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="header-shell">
          <a className="brand" href="#home" aria-label="Gramoz Shala, home">
            <span className="brand-name">Gramoz Shala</span>
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.filter((item) => item.id !== "contact").map((item) => (
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
            <a className="header-contact" href="#contact" aria-current={active === "contact" ? "location" : undefined}>
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
              onMouseDown={(event) => {
                event.preventDefault();
                event.currentTarget.focus({ preventScroll: true });
              }}
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" size={20} />
            </button>
          </div>
        </div>
      </header>

      {open && createPortal(
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
              <a className="brand" href="#home" onClick={selectSection}>
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
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={active === item.id ? "is-active" : undefined}
                  aria-current={active === item.id ? "location" : undefined}
                  onClick={selectSection}
                >
                  <strong>{item.label}</strong>
                  <ArrowRight aria-hidden="true" size={18} />
                </a>
              ))}
            </nav>

            <div className="mobile-menu-secondary">
              <ThemeToggle />
              <a
                className="menu-secondary-action"
                href={portfolio.contact.emailHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Gmail to email Gramoz"
                onClick={closeMenu}
              >
                <Mail aria-hidden="true" size={18} />
                <span>Email Gramoz</span>
              </a>
            </div>
          </div>
        </div>, document.body
      )}
    </>
  );
}

export function ExperienceTimeline() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="experience-list">
      {portfolio.experience.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `experience-panel-${index}`;
        const buttonId = `experience-button-${index}`;

        return (
          <article
            className={`experience-item${isOpen ? " is-open" : ""}`}
            key={item.organization}
          >
            <button
              className="experience-trigger"
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span className="experience-meta">
                <time>{item.period}</time>
                <span>{item.role}</span>
              </span>
              <span className="experience-title">{item.organization}</span>
              <ChevronDown
                className="experience-icon"
                aria-hidden="true"
                size={20}
              />
            </button>
            <div
              className="experience-panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              inert={!isOpen}
            >
              <div className="experience-panel-inner">
                <div className="experience-description">
                  <p>{item.summary}</p>
                  <ul>
                    {item.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ImpactMetrics() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setProgress(1);
          return;
        }

        const start = performance.now();
        const duration = 900;
        const animate = (now: number) => {
          const next = Math.min((now - start) / duration, 1);
          setProgress(1 - (1 - next) ** 3);
          if (next < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      className="impact-section"
      ref={sectionRef}
      aria-labelledby="impact-heading"
    >
      <div className="page-shell">
        <div className="section-label">
          <p>Verified impact</p>
        </div>
        <h2 className="sr-only" id="impact-heading">
          Impact metrics
        </h2>
        <dl className="impact-grid">
          {portfolio.impact.map((metric) => {
            const shouldAnimate = !metric.prefix;
            const animatedValue = shouldAnimate
              ? Math.round(metric.value * progress)
              : metric.value;
            const formatValue = (value: number) =>
              metric.prefix ? `${value}` : value.toLocaleString("en-US");
            const visibleValue = formatValue(animatedValue);
            const finalValue = `${metric.prefix ?? ""}${formatValue(
              metric.value,
            )}${metric.suffix ?? ""}`;

            return (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>
                  <span aria-hidden="true">
                    {metric.prefix}
                    {visibleValue}
                    {metric.suffix}
                  </span>
                  <span className="sr-only">{finalValue}</span>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

export function CertificationArchive() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="certification-list">
      {portfolio.certifications.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `certification-panel-${index}`;
        const buttonId = `certification-button-${index}`;

        return (
          <article
            className={`certification-item${isOpen ? " is-open" : ""}`}
            key={item.name}
          >
            <button
              id={buttonId}
              className="certification-trigger"
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="certification-title">{item.name}</span>
              <ChevronDown
                className="certification-icon"
                aria-hidden="true"
                size={20}
              />
            </button>
            <div
              className="certification-panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              inert={!isOpen}
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
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall back for browsers that expose Clipboard API without write permission.
    }
  }

  const input = document.createElement("textarea");
  const previousFocus = document.activeElement;
  const scrollY = window.scrollY;
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  input.style.fontSize = "16px";
  document.body.appendChild(input);
  try {
    input.focus({ preventScroll: true });
    input.select();
    input.setSelectionRange(0, value.length);
    if (!document.execCommand("copy")) throw new Error("Copy was not permitted");
  } finally {
    input.remove();
    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    window.scrollTo({ top: scrollY, behavior: "instant" });
  }
}

export function ContactMethod({
  type,
  value,
  href,
  external = false,
}: {
  type: "Email" | "Phone";
  value: string;
  href: string;
  external?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const timerRef = useRef<number | null>(null);
  const Icon = type === "Email" ? Mail : Phone;

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = async () => {
    setCopyFailed(false);
    try {
      await copyText(value);
      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  };

  return (
    <article className="contact-method">
      <div className="contact-method-label">
        <Icon aria-hidden="true" size={18} />
        <span>{type}</span>
      </div>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={external ? "Open Gmail to email Gramoz" : undefined}
      >
        {value}
      </a>
      <button
        className="copy-button"
        type="button"
        onClick={copy}
        aria-label={`Copy ${type.toLowerCase()}`}
      >
        {copied ? (
          <Check aria-hidden="true" size={17} />
        ) : (
          <Copy aria-hidden="true" size={17} />
        )}
        <span>{copied ? "Copied" : `Copy ${type.toLowerCase()}`}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? `${type} copied` : ""}
      </span>
      {copyFailed && (
        <p className="copy-feedback" role="status">
          Couldn’t copy. Touch and hold the {type.toLowerCase()} above to copy it.
        </p>
      )}
    </article>
  );
}
