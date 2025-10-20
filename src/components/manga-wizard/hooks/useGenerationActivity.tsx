"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface GenerationStage {
  active: boolean;
  previews: string[];
}

type ActivityStageKey =
  | "storyPlanning"
  | "agentCollaboration"
  | "characterGeneration"
  | "sceneGeneration"
  | "panelSynthesis"
  | "consistencyCheck";

interface GenerationActivityState {
  started: boolean;
  completed: boolean;
  storyPlanning: GenerationStage;
  agentCollaboration: GenerationStage;
  characterGeneration: GenerationStage;
  sceneGeneration: GenerationStage;
  panelSynthesis: GenerationStage;
  consistencyCheck: GenerationStage;
}

type StageKey = ActivityStageKey;
type ControlKey = "started" | "completed";

type GenerationActivityContextType = {
  stages: GenerationActivityState;
  percentComplete: number;
  activateStage: (key: StageKey | ControlKey, previews?: string[]) => void;
  appendPreview: (key: StageKey, preview: string) => void;
  updatePercent: (value: number) => void;
  reset: () => void;
};

const defaultStage: GenerationStage = { active: false, previews: [] };

const createDefaultState = (): GenerationActivityState => ({
  started: false,
  completed: false,
  storyPlanning: { ...defaultStage },
  agentCollaboration: { ...defaultStage },
  characterGeneration: { ...defaultStage },
  sceneGeneration: { ...defaultStage },
  panelSynthesis: { ...defaultStage },
  consistencyCheck: { ...defaultStage },
});

const GenerationActivityContext = createContext<GenerationActivityContextType | null>(null);

export const GenerationActivityProvider = ({ children }: { children: React.ReactNode }) => {
  const [stages, setStages] = useState<GenerationActivityState>(createDefaultState());
  const [percentComplete, setPercentComplete] = useState(0);

  const stagePercent: Record<ActivityStageKey, number> = {
    storyPlanning: 10,
    agentCollaboration: 30,
    characterGeneration: 45,
    sceneGeneration: 60,
    panelSynthesis: 80,
    consistencyCheck: 95,
  };

  const activateStage = useCallback(
    (key: StageKey | ControlKey, previews: string[] = []) => {
      if (key === "started" || key === "completed") {
        setStages((prev) => ({ ...prev, [key]: true } as GenerationActivityState));
        if (key === "completed") {
          setPercentComplete(100);
        }
        return;
      }

      const stageKey = key as StageKey;
      setStages((prev) => ({
        ...prev,
        started: true,
        [stageKey]: {
          active: true,
          previews: previews.length ? previews : prev[stageKey].previews,
        },
      }));

      const target = stagePercent[stageKey];
      setPercentComplete((prev) => Math.max(prev, target));
    },
    []
  );

  const appendPreview = useCallback((key: StageKey, preview: string) => {
    setStages((prev) => ({
      ...prev,
      [key]: {
        active: true,
        previews: [...prev[key].previews, preview].slice(-6),
      },
    }));
  }, []);

  const updatePercent = useCallback((value: number) => {
    setPercentComplete((prev) => {
      const next = Math.max(0, Math.min(100, Math.round(value)));
      return next < prev ? prev : next;
    });
  }, []);

  const reset = useCallback(() => {
    setStages(createDefaultState());
    setPercentComplete(0);
  }, []);

  const value = useMemo(
    () => ({ stages, percentComplete, activateStage, appendPreview, updatePercent, reset }),
    [stages, percentComplete, activateStage, appendPreview, updatePercent, reset]
  );

  return (
    <GenerationActivityContext.Provider value={value}>
      {children}
    </GenerationActivityContext.Provider>
  );
};

export const useGenerationActivity = () => {
  const ctx = useContext(GenerationActivityContext);
  if (!ctx) {
    throw new Error("useGenerationActivity must be used within GenerationActivityProvider");
  }
  return ctx;
};


