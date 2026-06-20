"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const PATHS: Record<string, (f: string, s?: string) => ReactNode> = {
  cloud: (f, s) => <path d="M50,15 Q72,4 76,25 Q91,22 91,40 Q99,53 84,67 Q91,83 74,84 Q62,96 50,87 Q38,96 26,84 Q9,83 16,67 Q1,53 9,40 Q9,22 24,25 Q28,4 50,15Z" fill={f} stroke={s||"none"} strokeWidth={s?3:0}/>,
  star4: (f, s) => <path d="M50,2 C52,42 58,48 98,50 C58,52 52,58 50,98 C48,58 42,52 2,50 C42,48 48,42 50,2Z" fill={f} stroke={s||"none"} strokeWidth={s?3:0}/>,
  star8: (f, s) => <polygon points="50,5 57,33 82,18 67,43 95,50 67,57 82,82 57,67 50,95 43,67 18,82 33,57 5,50 33,43 18,18 43,33" fill={f} stroke={s||"none"} strokeWidth={s?2.5:0}/>,
  arrow: (f, s) => <path d="M30,88 L30,50 L14,50 L50,10 L86,50 L70,50 L70,88Z" fill={f} stroke={s||"none"} strokeWidth={s?3:0}/>,
  cross: (f, s) => <path d="M35,5 L65,5 L65,35 L95,35 L95,65 L65,65 L65,95 L35,95 L35,65 L5,65 L5,35 L35,35Z" fill={f} stroke={s||"none"} strokeWidth={s?2.5:0}/>,
  pie:   (f, s) => <path d="M50,50 L50,5 A45,45,0,1,1,5,50 Z" fill={f} stroke={s||"none"} strokeWidth={s?3:0}/>,
  pill:  (f, s) => <path d="M30,5 A20,20,0,0,1,70,5 L70,95 A20,20,0,0,1,30,95Z" fill={f} stroke={s||"none"} strokeWidth={s?3:0}/>,
  slash: (f, s) => <path d="M55,5 L72,5 L45,95 L28,95Z" fill={f} stroke={s||"none"} strokeWidth={s?2.5:0}/>,
  squircle: (f, s) => <rect x="5" y="5" width="90" height="90" rx="22" ry="22" fill={f} stroke={s||"none"} strokeWidth={s?3:0}/>,
  dots: (f) => <>{[20,50,80].flatMap(x=>[20,50,80].map(y=><circle key={`${x}${y}`} cx={x} cy={y} r={11} fill={f}/>))}</>,
  half: (f, s) => <path d="M5,50 A45,45,0,0,1,95,50 Z" fill={f} stroke={s||"none"} strokeWidth={s?3:0}/>,
};

type P = {
  type: string; fill: string; stroke?: string;
  size: number; top?: string; left?: string; right?: string; bottom?: string;
  rotate: number; opacity: number; float: boolean;
};

// Visible graphic system across the page — larger/bolder shapes weighted to the
// edges so the content column stays readable, with a few quieter interior marks.
const PLACEMENTS: P[] = [
  // ── Corners (bleed off-screen) ──
  { type:"cloud", fill:"#c9ee00", size:320, top:"-12%", left:"-9%",  rotate:-12, opacity:.10, float:true  },
  { type:"star4", fill:"#3535d5", size:340, top:"-14%", right:"-9%", rotate: 18, opacity:.11, float:true  },
  { type:"arrow", fill:"#c9ee00", size:300, top:"72%",  left:"-8%",  rotate:130, opacity:.09, float:true  },
  { type:"cloud", fill:"#e03a7a", size:280, top:"70%",  right:"-8%", rotate: 10, opacity:.10, float:true  },

  // ── Left & right edge band ──
  { type:"star8", fill:"#e03a7a", size:160, top:"22%", left:"-4%",  rotate: -6, opacity:.08, float:true  },
  { type:"pie",   fill:"#3535d5", size:220, top:"42%", left:"-6%",  rotate: 10, opacity:.09, float:true  },
  { type:"cross", fill:"#e53a0d", size:170, top:"31%", right:"-4%", rotate: 18, opacity:.08, float:false },
  { type:"star4", fill:"#c9ee00", size:160, top:"54%", right:"-5%", rotate: 26, opacity:.09, float:false },
  { type:"cross", fill:"#3535d5", size:130, top:"82%", right:"-3%", rotate:-15, opacity:.07, float:false },
  { type:"pill",  fill:"#e53a0d", size:120, top:"60%", left:"-3%",  rotate:-30, opacity:.07, float:true  },

  // ── Upper texture (above the fold, around the toolbar) ──
  { type:"dots",  fill:"#ebebdf", size: 84, top:"13%", left:"7%",   rotate:  0, opacity:.05, float:false },
  { type:"dots",  fill:"#c9ee00", size: 84, top:"14%", right:"6%",  rotate:  0, opacity:.06, float:false },
  { type:"star8", fill:"#ebebdf", size: 60, top:"9%",  left:"46%",  rotate:  0, opacity:.04, float:false },

  // ── Interior marks for depth (kept faint behind cards) ──
  { type:"squircle", fill:"#3535d5", size: 90, top:"50%", right:"8%",  rotate:  8, opacity:.05, float:false },
  { type:"star8",    fill:"#e53a0d", size:190, top:"83%", left:"42%",  rotate: 14, opacity:.06, float:false },
  { type:"pill",     fill:"#e03a7a", size:100, top:"88%", left:"58%",  rotate: 20, opacity:.06, float:false },
  { type:"slash",    fill:"#c9ee00", size: 70, top:"55%", left:"28%",  rotate:-10, opacity:.04, float:false },
  { type:"dots",     fill:"#e03a7a", size: 72, top:"72%", right:"22%", rotate:  0, opacity:.05, float:false },
  { type:"half",     fill:"#ebebdf", size: 88, top:"67%", right:"34%", rotate:180, opacity:.04, float:true  },
  { type:"star4",    fill:"#ebebdf", size: 66, top:"40%", left:"40%",  rotate: 30, opacity:.035,float:false },
];

export default function BackgroundShapes() {
  const prefersReduced = useReducedMotion();

  return (
    <div aria-hidden="true" style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      {PLACEMENTS.map((p, i) => {
        const style: React.CSSProperties = {
          position: "absolute",
          top: p.top, left: p.left, right: p.right, bottom: p.bottom,
          opacity: p.opacity,
          transform: `rotate(${p.rotate}deg)`,
          willChange: p.float ? "transform" : undefined,
        };

        const svg = (
          <svg width={p.size} height={p.size} viewBox="0 0 100 100">
            {PATHS[p.type]?.(p.fill, p.stroke)}
          </svg>
        );

        if (p.float && !prefersReduced) {
          return (
            <motion.div key={i} style={style}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: (i * 0.7) % 5 }}
            >{svg}</motion.div>
          );
        }
        return <div key={i} style={style}>{svg}</div>;
      })}
    </div>
  );
}
