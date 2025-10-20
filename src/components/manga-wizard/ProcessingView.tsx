"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ProcessingViewProps {
  statusMessage: string;
  progress: number;
}

export function ProcessingView({ statusMessage, progress }: ProcessingViewProps) {
  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 text-center py-12"
    >
      <div className="flex justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">{statusMessage}</h3>
        <Progress value={progress} className="w-full max-w-md mx-auto" />
        <p className="text-white/60">{progress}% complete</p>
      </div>
    </motion.div>
  );
}
