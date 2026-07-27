"use client";

import { useEffect, useRef } from "react";

type ParticleTypographyProps = {
  text: string;
  color?: string;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
};

const offscreenPoint = -10000;

export function ParticleTypography({
  text,
  color,
  className = "",
}: ParticleTypographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!container || !canvas || !context) return;

    let particles: Particle[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    let pointerX = offscreenPoint;
    let pointerY = offscreenPoint;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    let reducedMotion = motionQuery.matches;
    let coarsePointer = coarsePointerQuery.matches;
    let visible = true;
    let running = false;
    let currentColor = "rgb(59, 130, 246)";
    let lastPointerInput = 0;

    const syncColor = () => {
      const styles = getComputedStyle(document.documentElement);
      currentColor =
        (color ?? styles.getPropertyValue("--accent")).trim() ||
        "rgb(59, 130, 246)";
    };

    const render = (now = performance.now()) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = currentColor;
      let hasMotion = false;
      const ambientActive = coarsePointer && visible && !reducedMotion;
      const useAmbientPointer =
        ambientActive && now - lastPointerInput > 850 && width > 0 && height > 0;
      const activePointerX = useAmbientPointer
        ? width * (0.5 + Math.sin(now / 1180) * 0.34)
        : pointerX;
      const activePointerY = useAmbientPointer
        ? height * (0.52 + Math.cos(now / 1460) * 0.24)
        : pointerY;
      const pointerActive =
        useAmbientPointer ||
        (activePointerX > -999 && activePointerY > -999 && now - lastPointerInput < 1300);
      for (const particle of particles) {
        if (!reducedMotion) {
          const dx = activePointerX - particle.x;
          const dy = activePointerY - particle.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          if (pointerActive && distance < 118) {
            const force = (118 - distance) / 118;
            const strength = useAmbientPointer ? 0.48 : 0.98;
            particle.vx -= (dx / distance) * force * strength;
            particle.vy -= (dy / distance) * force * strength;
          }
          particle.vx += (particle.originX - particle.x) * 0.055;
          particle.vy += (particle.originY - particle.y) * 0.055;
          particle.vx *= 0.86;
          particle.vy *= 0.86;
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (
            Math.abs(particle.vx) > 0.015 ||
            Math.abs(particle.vy) > 0.015 ||
            Math.abs(particle.originX - particle.x) > 0.025 ||
            Math.abs(particle.originY - particle.y) > 0.025
          ) {
            hasMotion = true;
          }
        }
        context.beginPath();
        context.arc(particle.x, particle.y, 1.15, 0, Math.PI * 2);
        context.fill();
      }
      if (!reducedMotion && (hasMotion || pointerActive || ambientActive)) {
        frame = requestAnimationFrame(render);
      } else {
        running = false;
      }
    };

    const requestRender = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(render);
    };

    const initialise = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      let fontSize = Math.min(150, Math.max(64, width * (coarsePointer ? 0.28 : 0.22)));
      context.font = `700 ${fontSize}px Geist, Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      while (context.measureText(text).width > width * 0.92 && fontSize > 48) {
        fontSize -= 2;
        context.font = `700 ${fontSize}px Geist, Arial, sans-serif`;
      }
      context.clearRect(0, 0, width, height);
      context.fillStyle = currentColor;
      context.fillText(text, width / 2, height / 2 + 3);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const step = Math.max(coarsePointer ? 4 : 5, Math.round((coarsePointer ? 6 : 7) * dpr));
      particles = [];
      for (let y = 0; y < pixels.height; y += step) {
        for (let x = 0; x < pixels.width; x += step) {
          if (pixels.data[(y * pixels.width + x) * 4 + 3] > 128) {
            const originX = x / dpr;
            const originY = y / dpr;
            particles.push({
              x: originX + (Math.random() - 0.5) * 8,
              y: originY + (Math.random() - 0.5) * 8,
              originX,
              originY,
              vx: 0,
              vy: 0,
            });
          }
        }
      }
      cancelAnimationFrame(frame);
      running = false;
      requestRender();
    };

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const nextX = event.clientX - bounds.left;
      const nextY = event.clientY - bounds.top;
      if (nextX < 0 || nextY < 0 || nextX > bounds.width || nextY > bounds.height) {
        clearPointer();
        return;
      }
      pointerX = nextX;
      pointerY = nextY;
      lastPointerInput = performance.now();
      requestRender();
    };
    const updateTouch = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0];
      if (!touch) return;
      const bounds = canvas.getBoundingClientRect();
      const nextX = touch.clientX - bounds.left;
      const nextY = touch.clientY - bounds.top;
      if (nextX < 0 || nextY < 0 || nextX > bounds.width || nextY > bounds.height) return;
      pointerX = nextX;
      pointerY = nextY;
      lastPointerInput = performance.now();
      requestRender();
    };
    const clearPointer = () => {
      pointerX = offscreenPoint;
      pointerY = offscreenPoint;
      requestRender();
    };
    const handleMotionChange = () => {
      reducedMotion = motionQuery.matches;
      initialise();
    };
    const handlePointerTypeChange = () => {
      coarsePointer = coarsePointerQuery.matches;
      initialise();
    };
    const themeObserver = new MutationObserver(() => {
      syncColor();
      initialise();
    });
    const resizeObserver = new ResizeObserver(initialise);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible) requestRender();
      },
      { threshold: 0.05 },
    );
    syncColor();
    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    motionQuery.addEventListener("change", handleMotionChange);
    coarsePointerQuery.addEventListener("change", handlePointerTypeChange);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", updatePointer, { passive: true });
    window.addEventListener("touchstart", updateTouch, { passive: true });
    window.addEventListener("touchmove", updateTouch, { passive: true });
    window.addEventListener("pointercancel", clearPointer, { passive: true });
    window.addEventListener("blur", clearPointer);
    initialise();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      coarsePointerQuery.removeEventListener("change", handlePointerTypeChange);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", updatePointer);
      window.removeEventListener("touchstart", updateTouch);
      window.removeEventListener("touchmove", updateTouch);
      window.removeEventListener("pointercancel", clearPointer);
      window.removeEventListener("blur", clearPointer);
    };
  }, [color, text]);

  return (
    <div
      ref={containerRef}
      className={`particle-type ${className}`}
      role="img"
      aria-label={`${text} particle typography`}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
