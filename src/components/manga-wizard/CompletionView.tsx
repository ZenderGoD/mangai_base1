"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface CompletionViewProps {
  panelImages: string[];
  storyId: string;
}

export function CompletionView({ panelImages, storyId }: CompletionViewProps) {
  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 text-center py-8"
    >
      <div className="flex justify-center">
        <div className="rounded-full bg-green-500 p-6">
          <CheckCircle2 className="h-16 w-16 text-white" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Manga Created!</h2>
        <p className="text-white/80">Your manga chapter is ready to view</p>
      </div>

      {/* Vertical Scrollable Manga Preview */}
      <div className="max-h-96 overflow-y-auto border border-white/20 rounded-lg bg-black/20 p-4">
        <div className="space-y-4">
          {panelImages.map((img, i) => (
            <div key={i} className="relative w-full">
              <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <Image 
                  src={img} 
                  alt={`Panel ${i + 1}`} 
                  fill 
                  className="object-contain" 
                  unoptimized 
                />
                <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                  Panel {i + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button 
        onClick={() => window.location.href = `/story/${storyId}`}
        className="w-full h-12"
      >
        View Story & Chapters
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </motion.div>
  );
}
