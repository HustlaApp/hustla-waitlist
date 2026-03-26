"use client";

import { useEffect, useRef } from "react";

type GridSettings = {
  gridSize: number;
  curlRadius: number;
  influence: number;
  lineColor: string;
  glowColor: string;
};

const settings: GridSettings = {
  gridSize: 50,
  curlRadius: 150,
  influence: 0.5,
  lineColor: "rgba(0, 0, 0, 0.06)",
  glowColor: "rgba(255, 79, 0, 0.08)",
};

export function InteractiveWarpGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(
        window.visualViewport?.width ?? window.innerWidth,
        document.documentElement.clientWidth,
      );
      height = Math.max(
        window.visualViewport?.height ?? window.innerHeight,
        document.documentElement.clientHeight,
      );
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      pointerRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        active: true,
      };
    };

    const handleTouchEnd = () => {
      pointerRef.current.active = false;
    };

    const warpPoint = (x: number, y: number) => {
      const pointer = pointerRef.current;
      if (!pointer.active) {
        return { x, y };
      }

      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance > settings.curlRadius || distance === 0) {
        return { x, y };
      }

      const progress = 1 - distance / settings.curlRadius;
      const strength = progress * progress * settings.influence * 40;

      const tx = -dy / distance;
      const ty = dx / distance;

      return {
        x: x + tx * strength,
        y: y + ty * strength,
      };
    };

    const draw = () => {
      frame = window.requestAnimationFrame(draw);

      if (width === 0 || height === 0) {
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = settings.lineColor;

      for (let y = 0; y <= height + settings.gridSize; y += settings.gridSize) {
        ctx.beginPath();
        for (let x = 0; x <= width + settings.gridSize; x += 14) {
          const p = warpPoint(x, y);
          if (x === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      for (let x = 0; x <= width + settings.gridSize; x += settings.gridSize) {
        ctx.beginPath();
        for (let y = 0; y <= height + settings.gridSize; y += 14) {
          const p = warpPoint(x, y);
          if (y === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      const pointer = pointerRef.current;
      if (pointer.active) {
        const gradient = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          10,
          pointer.x,
          pointer.y,
          210,
        );
        gradient.addColorStop(0, settings.glowColor);
        gradient.addColorStop(1, "rgba(255, 79, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 210, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("touchstart", handleTouchMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("touchstart", handleTouchMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: `${settings.gridSize}px ${settings.gridSize}px`,
          backgroundPosition: "0 0",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
