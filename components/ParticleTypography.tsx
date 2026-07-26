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

export function ParticleTypography({
  text,
  color = "#3B82F6",
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
    let pointerX = -1000;
    let pointerY = -1000;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      for (const particle of particles) {
        if (!reducedMotion) {
          const dx = pointerX - particle.x;
          const dy = pointerY - particle.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          if (distance < 105) {
            const force = (105 - distance) / 105;
            particle.vx -= (dx / distance) * force * 0.8;
            particle.vy -= (dy / distance) * force * 0.8;
          }
          particle.vx += (particle.originX - particle.x) * 0.055;
          particle.vy += (particle.originY - particle.y) * 0.055;
          particle.vx *= 0.86;
          particle.vy *= 0.86;
          particle.x += particle.vx;
          particle.y += particle.vy;
        }
        context.beginPath();
        context.arc(particle.x, particle.y, 1.15, 0, Math.PI * 2);
        context.fill();
      }
      if (!reducedMotion) frame = requestAnimationFrame(render);
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
      const fontSize = Math.min(150, Math.max(64, width * 0.22));
      context.font = `700 ${fontSize}px Geist, Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      context.fillText(text, width / 2, height / 2 + 3);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const step = Math.max(5, Math.round(7 * dpr));
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
      render();
    };

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
    };
    const clearPointer = () => {
      pointerX = -1000;
      pointerY = -1000;
    };
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => {
      reducedMotion = motionQuery.matches;
      initialise();
    };
    const resizeObserver = new ResizeObserver(initialise);
    resizeObserver.observe(container);
    motionQuery.addEventListener("change", handleMotionChange);
    canvas.addEventListener("pointermove", updatePointer, { passive: true });
    canvas.addEventListener("pointerleave", clearPointer, { passive: true });
    initialise();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", clearPointer);
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
