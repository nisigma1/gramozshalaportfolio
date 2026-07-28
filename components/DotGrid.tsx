"use client";

import { useEffect, useRef } from "react";

type DotGridProps = {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  className?: string;
};

type Dot = { x: number; y: number; offsetX: number; offsetY: number; velocityX: number; velocityY: number };

const parseColor = (value: string) => {
  const rgbMatch = value.match(/\d+(\.\d+)?/g);
  if (rgbMatch && !value.trim().startsWith("#")) {
    return [
      Number(rgbMatch[0] ?? 0),
      Number(rgbMatch[1] ?? 0),
      Number(rgbMatch[2] ?? 0),
    ] as const;
  }
  const hex = value.trim().replace("#", "");
  const number = Number.parseInt(hex.length === 3 ? hex.split("").map((part) => part + part).join("") : hex, 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255] as const;
};

export function DotGrid({
  dotSize = 5,
  gap = 24,
  baseColor,
  activeColor,
  proximity = 120,
  className = "",
}: DotGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!wrapper || !canvas || !context) return;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let pointerX = -1000;
    let pointerY = -1000;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let running = false;
    let baseRgb = parseColor("rgb(40, 45, 53)");
    let activeRgb = parseColor("rgb(59, 130, 246)");

    const syncColors = () => {
      const styles = getComputedStyle(document.documentElement);
      baseRgb = parseColor(
        (baseColor ?? styles.getPropertyValue("--dot-base")).trim() ||
          "rgb(40, 45, 53)",
      );
      activeRgb = parseColor(
        (activeColor ?? styles.getPropertyValue("--accent")).trim() ||
          "rgb(59, 130, 246)",
      );
    };

    const resize = () => {
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const step = dotSize + gap;
      for (let y = dotSize / 2; y < height; y += step) {
        for (let x = dotSize / 2; x < width; x += step) {
          dots.push({ x, y, offsetX: 0, offsetY: 0, velocityX: 0, velocityY: 0 });
        }
      }
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const [baseR, baseG, baseB] = baseRgb;
      const [activeR, activeG, activeB] = activeRgb;
      let hasMotion = false;
      for (const dot of dots) {
        const distance = Math.hypot(dot.x - pointerX, dot.y - pointerY);
        const intensity = Math.max(0, 1 - distance / proximity);
        if (!reducedMotion) {
          dot.velocityX += (0 - dot.offsetX) * 0.025;
          dot.velocityY += (0 - dot.offsetY) * 0.025;
          dot.velocityX *= 0.82;
          dot.velocityY *= 0.82;
          dot.offsetX += dot.velocityX;
          dot.offsetY += dot.velocityY;
          if (
            Math.abs(dot.velocityX) > 0.015 ||
            Math.abs(dot.velocityY) > 0.015 ||
            Math.abs(dot.offsetX) > 0.02 ||
            Math.abs(dot.offsetY) > 0.02
          ) {
            hasMotion = true;
          }
        }
        const r = Math.round(baseR + (activeR - baseR) * intensity);
        const g = Math.round(baseG + (activeG - baseG) * intensity);
        const b = Math.round(baseB + (activeB - baseB) * intensity);
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.32 + intensity * 0.65})`;
        context.beginPath();
        context.arc(dot.x + dot.offsetX, dot.y + dot.offsetY, dotSize / 2, 0, Math.PI * 2);
        context.fill();
      }
      if (!reducedMotion && hasMotion) {
        frame = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    const requestDraw = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(draw);
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      if (pointerX < 0 || pointerY < 0 || pointerX > rect.width || pointerY > rect.height) {
        clearPointer();
        requestDraw();
        return;
      }
      for (const dot of dots) {
        const distance = Math.hypot(dot.x - pointerX, dot.y - pointerY);
        if (distance < proximity) {
          const push = (1 - distance / proximity) * 1.6;
          const angle = Math.atan2(dot.y - pointerY, dot.x - pointerX);
          dot.velocityX += Math.cos(angle) * push;
          dot.velocityY += Math.sin(angle) * push;
        }
      }
      requestDraw();
    };
    const triggerPulse = (event: PointerEvent) => {
      updatePointer(event);
      if (pointerX < 0 || pointerY < 0) return;
      for (const dot of dots) {
        const distance = Math.hypot(dot.x - pointerX, dot.y - pointerY);
        if (distance < proximity * 1.8) {
          const falloff = 1 - distance / (proximity * 1.8);
          const angle = Math.atan2(dot.y - pointerY, dot.x - pointerX);
          dot.velocityX += Math.cos(angle) * falloff * 7;
          dot.velocityY += Math.sin(angle) * falloff * 7;
        }
      }
      requestDraw();
    };
    const clearPointer = () => { pointerX = -1000; pointerY = -1000; };
    const observer = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(() => {
      syncColors();
      draw();
    });
    observer.observe(wrapper);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      draw();
    };
    motionQuery.addEventListener("change", onMotionChange);
    syncColors();
    resize();
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", triggerPulse, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", triggerPulse);
    };
  }, [activeColor, baseColor, dotSize, gap, proximity]);

  return <div ref={wrapperRef} className={`dot-grid ${className}`} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
