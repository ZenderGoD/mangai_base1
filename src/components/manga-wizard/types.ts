import { Id } from "../../../convex/_generated/dataModel";

export interface MangaGenerationWizardProps {
  storyId: Id<"stories">;
  chapterNumber: number;
  onSuccess?: () => void;
}

export type Step = 
  | "input" 
  | "planning-story"
  | "generating-story" 
  | "story-review" 
  | "extracting-elements" 
  | "generating-references" 
  | "breaking-panels" 
  | "generating-images" 
  | "checking-consistency"
  | "complete";

export interface StoryPlan {
  title: string;
  synopsis: string;
  totalChapters: number;
  estimatedPanelsPerChapter: number;
  chapterOutlines: Array<{
    chapterNumber: number;
    title: string;
    summary: string;
    estimatedPanels: number;
  }>;
}

export interface StoryData {
  narrative: string;
  panels: Array<{
    description: string;
    dialogue: string;
  }>;
}

export interface Character {
  name: string;
  description: string;
  imageUrl?: string;
  assetId?: string;
  seed?: number;
  role?: "protagonist" | "antagonist" | "supporting" | "minor" | "cameo";
  relationships?: Array<{
    characterName: string;
    relationshipType: string;
    description?: string;
  }>;
  angles?: Array<{
    id: string;
    imageUrl: string;
    assetId?: string;
    description: string;
    seed?: number;
  }>;
}

export interface Location {
  name: string;
  description: string;
  imageUrl?: string;
  seed?: number;
}

export interface Scenario {
  name: string;
  description: string;
  imageUrl?: string;
  seed?: number;
  type?: "action" | "dialogue" | "romance" | "comedy" | "drama" | "mystery" | "other";
  angles?: Array<{
    id: string;
    imageUrl: string;
    description: string;
    seed?: number;
  }>;
}

export interface Object {
  name: string;
  description: string;
  imageUrl?: string;
  seed?: number;
  category?: "weapon" | "tool" | "decoration" | "vehicle" | "clothing" | "food" | "other";
  angles?: Array<{
    id: string;
    imageUrl: string;
    description: string;
    seed?: number;
  }>;
}

export interface GeneratingAngles {
  characters: Set<number>;
  scenarios: Set<number>;
  objects: Set<number>;
}

export interface CharacterRelationship {
  characterName: string;
  relationshipType: string;
  description: string;
}
