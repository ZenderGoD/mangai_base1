"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradientClassName?: string;
}

export function AnimatedGradient({
  children,
  className,
  gradientClassName,
  ...props
}: AnimatedGradientProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <motion.div
        className={cn(
          "absolute inset-0 rounded-xl opacity-50 blur-3xl",
          gradientClassName
        )}
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #ff0080 0%, #7928ca 50%, #ff0080 100%)",
            "radial-gradient(circle at 100% 100%, #7928ca 0%, #ff0080 50%, #7928ca 100%)",
            "radial-gradient(circle at 0% 100%, #ff0080 0%, #7928ca 50%, #ff0080 100%)",
            "radial-gradient(circle at 100% 0%, #7928ca 0%, #ff0080 50%, #7928ca 100%)",
            "radial-gradient(circle at 0% 0%, #ff0080 0%, #7928ca 50%, #ff0080 100%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

