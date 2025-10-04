"use client";

import { CSSProperties, FC, ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";

interface TextShimmerProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
  as?: ElementType;
}

const TextShimmer: FC<TextShimmerProps> = ({
  children,
  className,
  shimmerWidth = 100,
  as: Component = "p",
}) => {
  return (
    <Component
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",
        "animate-shimmer bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        "bg-gradient-to-r from-transparent via-black/80 via-50% to-transparent dark:via-white/80",
        className,
      )}
    >
      {children}
    </Component>
  );
};

export default TextShimmer;
