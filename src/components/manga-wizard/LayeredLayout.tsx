"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

import Particles from "@/components/ui/particles";
import { BorderBeam } from "@/components/ui/border-beam";
import { GenerationHud } from "./hud/GenerationHud";

interface LayeredLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const LayeredLayout = forwardRef<HTMLDivElement, LayeredLayoutProps>(
  ({ children, className }, ref) => {
    return (
      <div className={cn("relative w-full", className)} ref={ref}>
        {/* Layer 3: HUD background (visual-only) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Particles className="pointer-events-none absolute inset-0 opacity-60" quantity={60} />
          <GenerationHud />
        </div>

        {/* Layer 2: Blurred glow around wizard */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative h-[85%] w-[85%] max-w-5xl">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-cyan-500/30 blur-3xl" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-500/10 via-transparent to-sky-500/10 blur-xl" />
            <BorderBeam
              className="z-10"
              size={180}
              borderWidth={1.5}
              duration={12}
              colorFrom="#ffffff55"
              colorTo="#94a3b855"
            />
          </div>
        </div>

        {/* Layer 1: Interactive wizard */}
        <div className="relative z-20">{children}</div>
      </div>
    );
  }
);

LayeredLayout.displayName = "LayeredLayout";


