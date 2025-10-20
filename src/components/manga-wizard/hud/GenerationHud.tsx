"use client";

import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Users, PanelsTopLeft, Bot, ImageIcon, ShieldCheck } from "lucide-react";

import { AnimatedBeam } from "@/components/ui/animated-beam";
import { Lens } from "@/components/ui/lens";
import { NumberTicker } from "@/components/ui/number-ticker";

import { useGenerationActivity } from "../hooks/useGenerationActivity";

const ICON_SIZE = 52;
type NodeKey = "planner" | "agents" | "characters" | "scenes" | "panels" | "consistency" | "complete";

export const GenerationHud = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Record<NodeKey, HTMLDivElement | null>>({
    planner: null,
    agents: null,
    characters: null,
    scenes: null,
    panels: null,
    consistency: null,
    complete: null,
  });
  const { stages, percentComplete } = useGenerationActivity();

  const setNodeRef = useMemo(
    () =>
      (key: NodeKey) => (el: HTMLDivElement | null) => {
        nodes.current[key] = el;
      },
    []
  );

  const nodeDefs = useMemo(
    () => [
      {
        key: "planner" as const,
        icon: Sparkles,
        active: stages.storyPlanning,
        images: stages.storyPlanning?.previews ?? [],
      },
      {
        key: "agents" as const,
        icon: Bot,
        active: stages.agentCollaboration,
        images: stages.agentCollaboration?.previews ?? [],
      },
      {
        key: "characters" as const,
        icon: Users,
        active: stages.characterGeneration,
        images: stages.characterGeneration?.previews ?? [],
      },
      {
        key: "scenes" as const,
        icon: ImageIcon,
        active: stages.sceneGeneration,
        images: stages.sceneGeneration?.previews ?? [],
      },
      {
        key: "panels" as const,
        icon: PanelsTopLeft,
        active: stages.panelSynthesis,
        images: stages.panelSynthesis?.previews ?? [],
      },
      {
        key: "consistency" as const,
        icon: ShieldCheck,
        active: stages.consistencyCheck,
        images: stages.consistencyCheck?.previews ?? [],
      },
    ],
    [stages]
  );

  const beams: Array<[NodeKey, NodeKey]> = useMemo(
    () => [
      ["planner", "agents"],
      ["agents", "characters"],
      ["characters", "scenes"],
      ["scenes", "panels"],
      ["panels", "consistency"],
      ["consistency", "complete"],
    ],
    []
  );

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-none relative grid h-full w-full max-w-5xl grid-cols-1 gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3">
        {nodeDefs.map(({ key, icon: Icon, active, images }, index) => (
          <motion.div
            key={key}
            ref={setNodeRef(key)}
            className="relative flex h-48 w-full max-w-sm flex-col items-center justify-center rounded-3xl border border-white/15 bg-white/10/20 backdrop-blur-lg"
            animate={{
              scale: active ? 1.04 : 0.98,
              opacity: active || stages.started ? 1 : 0.35,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-white/5" />
            <div className="relative flex flex-col items-center justify-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 shadow-lg"
              >
                <Icon className="h-7 w-7 text-white/80" />
              </div>
              <div className="mt-4 grid h-24 w-36 grid-cols-2 gap-3">
                {(images.length ? images : Array(4).fill(null)).slice(0, 4).map((url, idx) => (
                  <Lens key={`${key}-${idx}`} lensSize={70} zoomFactor={1.25} className="pointer-events-auto">
                    <div className="relative h-14 w-full overflow-hidden rounded-lg bg-black/40">
                      {url ? (
                        <Image src={url} alt={`${key}-preview-${idx}`} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700/40 via-slate-900/60 to-slate-800/40">
                          <Icon className="h-6 w-6 text-white/40" />
                        </div>
                      )}
                    </div>
                  </Lens>
                ))}
              </div>
            </div>
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{
                boxShadow: active
                  ? "0 0 40px rgba(147, 197, 253, 0.35)"
                  : "0 0 0 rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        ))}

        {/* Completion Node */}
        <motion.div
          ref={setNodeRef("complete")}
          className="pointer-events-none relative col-span-full mt-6 flex h-40 items-center justify-center rounded-3xl border border-white/10 bg-white/10/30 backdrop-blur-lg"
          animate={{
            scale: stages.completed ? 1.05 : 1,
            opacity: stages.started ? 1 : 0,
          }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-sky-500/20 to-purple-500/20" />
          <div className="pointer-events-auto relative flex items-baseline gap-4 text-5xl font-semibold text-white/90">
            <NumberTicker value={Math.round(percentComplete)} />
            <span className="text-2xl text-white/60">%</span>
          </div>
        </motion.div>

        {/* Beams */}
        {beams.map(([fromKey, toKey], idx) => (
          <AnimatedBeam
            key={`beam-${idx}`}
            containerRef={containerRef}
            fromRef={{ current: nodes.current[fromKey] ?? null }}
            toRef={{ current: nodes.current[toKey] ?? null }}
            curvature={120}
            pathColor="#ffffff20"
            pathOpacity={0.1}
            gradientStartColor="#38bdf8"
            gradientStopColor="#c084fc"
            duration={6 + idx}
            delay={idx * 0.5}
          />
        ))}
      </div>
    </div>
  );
};


