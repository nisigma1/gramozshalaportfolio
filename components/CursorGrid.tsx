"use client";

import { useEffect, useRef } from "react";

type CursorGridProps = {
  cellSize?: number;
  color?: string;
  radius?: number;
  className?: string;
};

const rgbFromHex = (hex: string) => {
  const value = hex.replace("#", "").padEnd(6, "0");
  const number = Number.parseInt(value.slice(0, 6), 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255] as const;
};

export function CursorGrid({
  cellSize = 64,
  color = "#3B82F6",
  radius = 150,
  className = "",
}: CursorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!container || !canvas || !context) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let animationFrame = 0;
    let running = false;
    let lastFrame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rebuild = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / cellSize) + 1;
      rows = Math.ceil(height / cellSize) + 1;
      offsetX = (width - columns * cellSize) / 2;
      offsetY = (height - rows * cellSize) / 2;
      alphas = new Float32Array(columns * rows);
      touched = new Float64Array(columns * rows);
    };

    const center = (index: number) => [
      offsetX + (index % columns) * cellSize + cellSize / 2,
      offsetY + Math.floor(index / columns) * cellSize + cellSize / 2,
    ] as const;

    const energize = (x: number, y: number) => {
      const now = performance.now();
      const minColumn = Math.max(0, Math.floor((x - radius - offsetX) / cellSize));
      const maxColumn = Math.min(columns - 1, Math.floor((x + radius - offsetX) / cellSize));
      const minRow = Math.max(0, Math.floor((y - radius - offsetY) / cellSize));
      const maxRow = Math.min(rows - 1, Math.floor((y + radius - offsetY) / cellSize));
      for (let row = minRow; row <= maxRow; row += 1) {
        for (let column = minColumn; column <= maxColumn; column += 1) {
          const index = row * columns + column;
          const [cx, cy] = center(index);
          const distance = Math.hypot(cx - x, cy - y);
          if (distance > radius) continue;
          const level = (1 - distance / radius) ** 2 * 0.9;
          alphas[index] = Math.max(alphas[index], level);
          touched[index] = now;
        }
      }
    };

    const draw = (now: number) => {
      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;
      context.clearRect(0, 0, width, height);
      const [red, green, blue] = rgbFromHex(color);
      let visible = false;
      for (let index = 0; index < alphas.length; index += 1) {
        let alpha = alphas[index];
        if (alpha <= 0) continue;
        if (now - touched[index] > 360) {
          alpha = Math.max(0, alpha - dt / 850);
          alphas[index] = alpha;
        }
        if (alpha <= 0) continue;
        visible = true;
        const [cx, cy] = center(index);
        const gradient = context.createRadialGradient(cx, cy, 2, cx, cy, cellSize);
        gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
        context.strokeStyle = gradient;
        context.lineWidth = 1;
        context.strokeRect(cx - cellSize / 2 + 0.5, cy - cellSize / 2 + 0.5, cellSize - 1, cellSize - 1);
      }
      if (visible) animationFrame = requestAnimationFrame(draw);
      else running = false;
    };

    const wake = () => {
      if (running || reducedMotion) return;
      running = true;
      lastFrame = performance.now();
      animationFrame = requestAnimationFrame(draw);
    };
    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      energize(x, y);
      wake();
    };
    const onPointerLeave = () => {
    };
    const resizeObserver = new ResizeObserver(() => {
      rebuild();
      wake();
    });
    resizeObserver.observe(container);
    rebuild();
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [cellSize, color, radius]);

  return (
    <div ref={containerRef} className={`cursor-grid ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
