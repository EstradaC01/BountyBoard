"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// ─── SVG shape paths (100×100 viewBox) ───────────────────────────────────────

const PATHS: Record<string, (fill: string, stroke?: string) => ReactNode> = {
  cloud: (f, s) => (
    <path d="M50,15 Q72,4 76,25 Q91,22 91,40 Q99,53 84,67 Q91,83 74,84 Q62,96 50,87 Q38,96 26,84 Q9,83 16,67 Q1,53 9,40 Q9,22 24,25 Q28,4 50,15Z"
      fill={f} stroke={s || "none"} strokeWidth={s ? 3 : 0} />
  ),
  star4: (f, s) => (
    <path d="M50,2 C52,42 58,48 98,50 C58,52 52,58 50,98 C48,58 42,52 2,50 C42,48 48,42 50,2Z"
      fill={f} stroke={s || "none"} strokeWidth={s ? 3 : 0} />
  ),
  star8: (f, s) => (
    <polygon points="50,5 57,33 82,18 67,43 95,50 67,57 82,82 57,67 50,95 43,67 18,82 33,57 5,50 33,43 18,18 43,33"
      fill={f} stroke={s || "none"} strokeWidth={s ? 2.5 : 0} />
  ),
  arrow: (f, s) => (
    <path d="M30,88 L30,50 L14,50 L50,10 L86,50 L70,50 L70,88Z"
      fill={f} stroke={s || "none"} strokeWidth={s ? 3 : 0} />
  ),
  cross: (f, s) => (
    <path d="M35,5 L65,5 L65,35 L95,35 L95,65 L65,65 L65,95 L35,95 L35,65 L5,65 L5,35 L35,35Z"
      fill={f} stroke={s || "none"} strokeWidth={s ? 2.5 : 0} />
  ),
  pie: (f, s) => (
    <path d="M50,50 L50,5 A45,45,0,1,1,5,50 Z"
      fill={f} stroke={s || "none"} strokeWidth={s ? 3 : 0} />
  ),
  pill: (f, s) => (
    <path d="M30,5 A20,20,0,0,1,70,5 L70,95 A20,20,0,0,1,30,95Z"
      fill={f} stroke={s || "none"} strokeWidth={s ? 3 : 0} />
  ),
  slash: (f, s) => (
    <path d="M55,5 L72,5 L45,95 L28,95Z"
      fill={f} stroke={s || "none"} strokeWidth={s ? 2.5 : 0} />
  ),
  squircle: (f, s) => (
    <rect x="5" y="5" width="90" height="90" rx="22" ry="22"
      fill={f} stroke={s || "none"} strokeWidth={s ? 3 : 0} />
  ),
  dots: (f) => (
    <>
      {[20, 50, 80].flatMap(x => [20, 50, 80].map(y => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={11} fill={f} />
      )))}
    </>
  ),
};

// ─── Shape placements ─────────────────────────────────────────────────────────
// Positions are % of viewport. Sizes in px.
// float shapes drift up/down slowly.

type Placement = {
  type: string;
  fill: string;
  stroke?: string;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotate: number;
  opacity: number;
  float: boolean;
};

const PLACEMENTS: Placement[] = [
  // ── TOP LEFT — large chartreuse cloud bleeds off-screen ──
  { type: "cloud",    fill: "#c9ee00", size: 280, top: "-10%", left: "-8%",  rotate: -12, opacity: 0.10, float: true  },
  { type: "star8",   fill: "#ebebdf", size: 68,  top:  "9%",  left: "17%",  rotate:   0, opacity: 0.05, float: false },
  { type: "slash",   fill: "#ebebdf", size: 56,  top:  "3%",  left: "30%",  rotate:   8, opacity: 0.04, float: false },

  // ── TOP RIGHT — cobalt star4 bleeds off-screen ──
  { type: "star4",   fill: "#3535d5", size: 300, top: "-12%", right: "-8%", rotate:  20, opacity: 0.12, float: true  },
  { type: "dots",    fill: "#ebebdf", size: 72,  top:  "8%",  right: "17%", rotate:   0, opacity: 0.05, float: false },

  // ── LEFT EDGE — orange cross ──
  { type: "cross",   fill: "#e53a0d", size: 200, top:  "28%", left: "-7%",  rotate:  18, opacity: 0.09, float: false },
  { type: "pill",    fill: "#ebebdf", size: 84,  top:  "42%", left:  "7%",  rotate: -28, opacity: 0.04, float: true  },

  // ── RIGHT EDGE — cobalt pie ──
  { type: "pie",     fill: "#3535d5", size: 240, top:  "32%", right: "-8%", rotate:  10, opacity: 0.10, float: true  },
  { type: "slash",   fill: "#ebebdf", size: 72,  top:  "25%", right: "14%", rotate:  -5, opacity: 0.04, float: false },

  // ── CENTER FIELD — pink star, low opacity ──
  { type: "star8",   fill: "#e03a7a", size: 180, top:  "18%", left: "43%",  rotate:  -6, opacity: 0.07, float: true  },
  { type: "squircle",fill: "#ebebdf", size: 76,  top:  "50%", left: "60%",  rotate:  12, opacity: 0.04, float: false },
  { type: "star4",   fill: "#ebebdf", size: 64,  top:  "38%", left: "28%",  rotate:  30, opacity: 0.04, float: false },

  // ── BOTTOM LEFT — green arrow rotated ──
  { type: "arrow",   fill: "#c9ee00", size: 260, top:  "68%", left: "-6%",  rotate: 130, opacity: 0.09, float: true  },
  { type: "star8",   fill: "#ebebdf", size: 70,  top:  "80%", left: "16%",  rotate:  25, opacity: 0.04, float: false },

  // ── BOTTOM RIGHT — pink cloud ──
  { type: "cloud",   fill: "#e03a7a", size: 240, top:  "66%", right: "-6%", rotate:  10, opacity: 0.10, float: true  },
  { type: "dots",    fill: "#ebebdf", size: 70,  top:  "74%", right: "18%", rotate:   0, opacity: 0.04, float: false },

  // ── BOTTOM CENTER — orange star ──
  { type: "star8",   fill: "#e53a0d", size: 190, top:  "76%", left: "41%",  rotate:  15, opacity: 0.08, float: false },

  // ── EXTRA TEXTURE — scattered small fills ──
  { type: "cross",   fill: "#ebebdf", size: 58,  top:  "14%", left: "53%",  rotate:  45, opacity: 0.04, float: false },
  { type: "slash",   fill: "#3535d5", size: 70,  top:  "58%", left: "22%",  rotate: -10, opacity: 0.05, float: false },
  { type: "pill",    fill: "#e03a7a", size: 90,  top:  "62%", left: "50%",  rotate:  60, opacity: 0.05, float: false },
];

// ─── Renderer ─────────────────────────────────────────────────────────────────

export default function BackgroundShapes() {
  const prefersReduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {PLACEMENTS.map((p, i) => {
        const posStyle: React.CSSProperties = {
          position: "absolute",
          top:    p.top,
          left:   p.left,
          right:  p.right,
          bottom: p.bottom,
          opacity: p.opacity,
          transform: `rotate(${p.rotate}deg)`,
          willChange: p.float ? "transform" : undefined,
        };

        const svgEl = (
          <svg width={p.size} height={p.size} viewBox="0 0 100 100">
            {PATHS[p.type]?.(p.fill, p.stroke)}
          </svg>
        );

        if (p.float && !prefersReduced) {
          const dur = 6 + (i % 5);
          const delay = (i * 0.6) % 4;
          return (
            <motion.div
              key={i}
              style={posStyle}
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
            >
              {svgEl}
            </motion.div>
          );
        }

        return (
          <div key={i} style={posStyle}>
            {svgEl}
          </div>
        );
      })}
    </div>
  );
}
