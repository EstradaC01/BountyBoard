"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const P = {
  W: "#ebebdf",
  G: "#c9ee00",
  B: "#3535d5",
  O: "#e53a0d",
  K: "#e03a7a",
};

// ─── SVG shapes (100×100 viewBox) ────────────────────────────────────────────

function Cloud({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <path
      d="M50,15 Q72,4 76,25 Q91,22 91,40 Q99,53 84,67 Q91,83 74,84 Q62,96 50,87 Q38,96 26,84 Q9,83 16,67 Q1,53 9,40 Q9,22 24,25 Q28,4 50,15Z"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3.5 : 0}
    />
  );
}

function Star4({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <path
      d="M50,2 C52,42 58,48 98,50 C58,52 52,58 50,98 C48,58 42,52 2,50 C42,48 48,42 50,2Z"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3.5 : 0}
    />
  );
}

function Star8({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <polygon
      points="50,5 57,33 82,18 67,43 95,50 67,57 82,82 57,67 50,95 43,67 18,82 33,57 5,50 33,43 18,18 43,33"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3 : 0}
    />
  );
}

function Arrow({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <path
      d="M30,88 L30,50 L14,50 L50,10 L86,50 L70,50 L70,88Z"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3.5 : 0}
    />
  );
}

function Cross({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <path
      d="M35,5 L65,5 L65,35 L95,35 L95,65 L65,65 L65,95 L35,95 L35,65 L5,65 L5,35 L35,35Z"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3 : 0}
    />
  );
}

function Dots({ fill }: { fill: string }) {
  const pos = [20, 50, 80];
  return (
    <>
      {pos.flatMap((x) => pos.map((y) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={11} fill={fill} />
      )))}
    </>
  );
}

function Pill({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <path
      d="M30,5 A20,20,0,0,1,70,5 L70,95 A20,20,0,0,1,30,95Z"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3.5 : 0}
    />
  );
}

function Slash({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <path
      d="M55,5 L72,5 L45,95 L28,95Z"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3 : 0}
    />
  );
}

function Pie({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <path
      d="M50,50 L50,5 A45,45,0,1,1,5,50 Z"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3.5 : 0}
    />
  );
}

function Squircle({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <rect x="5" y="5" width="90" height="90" rx="22" ry="22"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3.5 : 0}
    />
  );
}

function DiamondGrid({ fill, stroke }: { fill: string; stroke?: string }) {
  const pos = [30, 70];
  return (
    <>
      {pos.flatMap((x) => pos.map((y) => (
        <polygon key={`${x}-${y}`}
          points={`${x},${y - 18} ${x + 18},${y} ${x},${y + 18} ${x - 18},${y}`}
          fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 2.5 : 0}
        />
      )))}
    </>
  );
}

function HalfCircle({ fill, stroke }: { fill: string; stroke?: string }) {
  return (
    <path
      d="M5,50 A45,45,0,0,1,95,50 Z"
      fill={fill} stroke={stroke || "none"} strokeWidth={stroke ? 3.5 : 0}
    />
  );
}

// ─── Shape element ────────────────────────────────────────────────────────────

type ShapeItem = {
  type: string;
  fill: string;
  stroke?: string;
  rotate?: number;
  size: number;
  align: "flex-start" | "center" | "flex-end";
};

function ShapeEl({ item }: { item: ShapeItem }) {
  const { fill, stroke, rotate, size, align, type } = item;

  // Invisible spacer for inter-group breathing room
  if (type === "_gap") {
    return <div style={{ width: size, flexShrink: 0, alignSelf: "stretch" }} />;
  }

  const inner: Record<string, ReactNode> = {
    cloud:       <Cloud fill={fill} stroke={stroke} />,
    star4:       <Star4 fill={fill} stroke={stroke} />,
    star8:       <Star8 fill={fill} stroke={stroke} />,
    arrow:       <Arrow fill={fill} stroke={stroke} />,
    cross:       <Cross fill={fill} stroke={stroke} />,
    dots:        <Dots fill={fill} />,
    pill:        <Pill fill={fill} stroke={stroke} />,
    slash:       <Slash fill={fill} stroke={stroke} />,
    pie:         <Pie fill={fill} stroke={stroke} />,
    squircle:    <Squircle fill={fill} stroke={stroke} />,
    diamondGrid: <DiamondGrid fill={fill} stroke={stroke} />,
    half:        <HalfCircle fill={fill} stroke={stroke} />,
  };

  return (
    <div style={{
      width: size,
      height: size,
      flexShrink: 0,
      alignSelf: align,
      transform: rotate ? `rotate(${rotate}deg)` : undefined,
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {inner[type]}
      </svg>
    </div>
  );
}

// ─── Items: clusters of 2–3 shapes separated by gaps ─────────────────────────
// Three size tiers: LARGE=hero anchor, MED=supporting, SM=texture detail
// LARGE shapes carry the palette colors; SM/outline shapes recede

const ITEMS: ShapeItem[] = [
  // ── CLUSTER 1: chartreuse cloud dominates ──
  { type: "cloud",    fill: P.G,   size: 112, align: "flex-end" },
  { type: "star8",   fill: P.W,   size: 40,  align: "flex-start" },
  { type: "slash",   fill: P.W,   size: 50,  align: "center" },

  { type: "_gap", fill: "", size: 60, align: "center" },

  // ── CLUSTER 2: cobalt arrow diagonal ──
  { type: "arrow",   fill: P.B,   size: 106, align: "flex-start", rotate: 45 },
  { type: "cross",   fill: "none", stroke: P.W, size: 44, align: "flex-end" },
  { type: "dots",    fill: P.G,   size: 58,  align: "center" },

  { type: "_gap", fill: "", size: 60, align: "center" },

  // ── CLUSTER 3: orange pie chart ──
  { type: "pie",     fill: P.O,   size: 110, align: "center" },
  { type: "pill",    fill: "none", stroke: P.W, size: 56, align: "flex-end" },
  { type: "star4",   fill: P.W,   size: 40,  align: "flex-start" },

  { type: "_gap", fill: "", size: 60, align: "center" },

  // ── CLUSTER 4: pink cloud ──
  { type: "cloud",   fill: P.K,   size: 108, align: "flex-end" },
  { type: "squircle", fill: P.W,  size: 42,  align: "flex-start" },
  { type: "diamondGrid", fill: "none", stroke: P.W, size: 52, align: "center" },

  { type: "_gap", fill: "", size: 60, align: "center" },

  // ── CLUSTER 5: cobalt 4-pointed star ──
  { type: "star4",   fill: P.B,   size: 105, align: "flex-start" },
  { type: "half",    fill: P.W,   size: 62,  align: "flex-end" },
  { type: "slash",   fill: P.O,   size: 44,  align: "center" },

  { type: "_gap", fill: "", size: 60, align: "center" },

  // ── CLUSTER 6: chartreuse spiky star ──
  { type: "star8",   fill: P.G,   size: 110, align: "center" },
  { type: "cloud",   fill: "none", stroke: P.W, size: 54, align: "flex-end" },
  { type: "arrow",   fill: P.W,   size: 42,  align: "flex-start" },

  { type: "_gap", fill: "", size: 60, align: "center" },

  // ── CLUSTER 7: pink pill + cobalt cross ──
  { type: "pill",    fill: P.K,   size: 100, align: "flex-end" },
  { type: "star8",   fill: "none", stroke: P.W, size: 52, align: "flex-start" },
  { type: "dots",    fill: P.B,   size: 60,  align: "center" },

  { type: "_gap", fill: "", size: 60, align: "center" },

  // ── CLUSTER 8: orange cross ──
  { type: "cross",   fill: P.O,   size: 108, align: "center" },
  { type: "star4",   fill: "none", stroke: P.W, size: 48, align: "flex-end" },
  { type: "pie",     fill: "none", stroke: P.W, size: 56, align: "flex-start" },

  { type: "_gap", fill: "", size: 60, align: "center" },
];

// ─── Marquee ──────────────────────────────────────────────────────────────────

export default function ShapesHero() {
  const prefersReduced = useReducedMotion();
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <section
      aria-hidden="true"
      style={{
        backgroundColor: "#0a0a0a",
        borderBottom: "1px solid #222220",
        height: 152,
        overflow: "hidden",
        userSelect: "none",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <motion.div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 14,
          padding: "16px 0",
          width: "max-content",
        }}
        animate={prefersReduced ? {} : { x: ["0%", "-50%"] }}
        transition={prefersReduced ? {} : {
          duration: 48,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        {doubled.map((item, i) => (
          <ShapeEl key={i} item={item} />
        ))}
      </motion.div>
    </section>
  );
}
