"use client";

import { BookOpen, Wand2, Users, Image as ImageIcon, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { Step } from "./types";

interface StepIndicatorProps {
  step: Step;
}

const steps = [
  { id: "input", label: "Story Idea", icon: BookOpen },
  { id: "generating-story", label: "Generate", icon: Wand2 },
  { id: "extracting-elements", label: "Extract", icon: Users },
  { id: "generating-references", label: "References", icon: ImageIcon },
  { id: "generating-images", label: "Artwork", icon: Sparkles },
  { id: "complete", label: "Complete", icon: CheckCircle2 },
];

export function StepIndicator({ step }: StepIndicatorProps) {
  const currentStepIndex = steps.findIndex(s => 
    step.includes(s.id) || 
    (s.id === "generating-story" && step === "story-review") ||
    (s.id === "generating-images" && step === "breaking-panels")
  );

  return (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
      {steps.map((s, index) => {
        const Icon = s.icon;
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;

        return (
          <div key={s.id} className="flex items-center flex-shrink-0">
            <div className={`flex flex-col items-center gap-2 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
              <div className={`
                rounded-full p-3 flex items-center justify-center transition-all
                ${isCompleted ? 'bg-green-500' : isActive ? 'bg-primary animate-pulse' : 'bg-white/10'}
              `}>
                <Icon className={`h-5 w-5 ${isCompleted || isActive ? 'text-white' : 'text-white/50'}`} />
              </div>
              <span className={`text-xs text-center ${isActive ? 'text-white font-semibold' : 'text-white/60'}`}>
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className={`h-5 w-5 mx-2 ${index < currentStepIndex ? 'text-green-500' : 'text-white/30'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
