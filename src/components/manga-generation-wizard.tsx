"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card as GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Sparkles, 
  BookOpen, 
  Image as ImageIcon, 
  Users, 
  Wand2,
  CheckCircle2,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface MangaGenerationWizardProps {
  storyId: Id<"stories">;
  chapterNumber: number;
  onSuccess?: () => void;
}

type Step = 
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

interface StoryPlan {
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

interface StoryData {
  narrative: string;
  panels: Array<{
    description: string;
    dialogue: string;
  }>;
}

interface Character {
  name: string;
  description: string;
  imageUrl?: string;
}

interface Location {
  name: string;
  description: string;
  imageUrl?: string;
}

export function MangaGenerationWizard({ storyId, chapterNumber, onSuccess }: MangaGenerationWizardProps) {
  const createChapter = useMutation(api.chapters.createChapter);
  
  const [step, setStep] = useState<Step>("input");
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("fantasy");
  const [style, setStyle] = useState("manga");
  const [numberOfPanels, setNumberOfPanels] = useState(8);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [storyPlan, setStoryPlan] = useState<StoryPlan | null>(null);
  const [error, setError] = useState("");
  
  // Generated data
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [panelImages, setPanelImages] = useState<string[]>([]);

  // Step 0: Plan the Story Structure
  const handlePlanStory = async () => {
    if (!prompt.trim()) {
      setError("Please enter a story idea");
      return;
    }

    setStep("planning-story");
    setError("");
    setProgress(5);
    setStatusMessage("🧠 AI is planning your story structure...");

    try {
      const response = await fetch("/api/plan-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, genre }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to plan story");
      }

      setStoryPlan(data);
      setNumberOfPanels(data.estimatedPanelsPerChapter || 8);
      setProgress(10);
      console.log("📋 Story Plan:", data);
      
      // Automatically proceed to generate the first chapter
      await handleGenerateStory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to plan story");
      setStep("input");
      setProgress(0);
    }
  };

  // Step 1: Generate Story Narrative
  const handleGenerateStory = async (plan?: StoryPlan) => {
    const currentPlan = plan || storyPlan;
    
    setStep("generating-story");
    setProgress(15);
    setStatusMessage("🤖 AI is crafting your story narrative...");

    try {
      // Generate the specific chapter based on the plan
      const chapterOutline = currentPlan?.chapterOutlines?.find(
        (ch) => ch.chapterNumber === chapterNumber
      );
      
      const chapterPrompt = chapterOutline
        ? `${currentPlan?.title} - Chapter ${chapterNumber}: ${chapterOutline.title}. ${chapterOutline.summary}`
        : prompt;

      // Call API to generate story
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: chapterPrompt, 
          genre, 
          numberOfPanels: currentPlan?.estimatedPanelsPerChapter || numberOfPanels 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate story");
      }

      setStoryData({
        narrative: data.story,
        panels: [],
      });
      
      setProgress(20);
      setStep("story-review");
      setStatusMessage("✅ Story generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate story");
      setStep("input");
      setProgress(0);
    }
  };

  // Step 2: Extract Characters & Elements (Auto-triggered)
  const handleExtractElements = async () => {
    setStep("extracting-elements");
    setProgress(30);
    setStatusMessage("🔍 Extracting characters, locations, and story elements...");

    try {
      // Use GPT to extract entities from the narrative
      const response = await fetch("/api/extract-elements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narrative: storyData?.narrative }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to extract elements");
      }

      const extractedCharacters = data.characters || [];
      const extractedLocations = data.locations || [];
      
      setCharacters(extractedCharacters);
      setLocations(extractedLocations);
      setProgress(40);
      
      console.log("✅ Elements extracted:", { 
        characters: extractedCharacters.length, 
        locations: extractedLocations.length 
      });
      
      // Auto-proceed to next step immediately with extracted data
      await handleGenerateReferences(extractedCharacters, extractedLocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract elements");
      setStep("story-review");
    }
  };

  // Step 3: Generate Reference Images
  const handleGenerateReferences = async (chars?: Character[], locs?: Location[]) => {
    const charactersToUse = chars || characters;
    const locationsToUse = locs || locations;
    
    setStep("generating-references");
    setProgress(50);
    setStatusMessage("🎨 Generating reference images for characters and locations...");

    try {
      // Generate character images
      const characterPromises = charactersToUse.map(async (char) => {
        const prompt = `${style} style character design: ${char.description}, full body, reference sheet, white background`;
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, aspectRatio: "3:4" }),
        });
        const data = await response.json();
        return { ...char, imageUrl: data.imageUrl };
      });

      // Generate location images
      const locationPromises = locationsToUse.map(async (loc) => {
        const prompt = `${style} style background: ${loc.description}, detailed environment, manga panel background`;
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, aspectRatio: "16:9" }),
        });
        const data = await response.json();
        return { ...loc, imageUrl: data.imageUrl };
      });

      const updatedCharacters = await Promise.all(characterPromises);
      const updatedLocations = await Promise.all(locationPromises);

      setCharacters(updatedCharacters);
      setLocations(updatedLocations);
      setProgress(65);
      
      console.log("✅ Reference images generated");
      
      // Auto-proceed to next step immediately
      await handleBreakIntoPanels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate reference images");
    }
  };

  // Step 4: Break Story into Panels
  const handleBreakIntoPanels = async () => {
    setStep("breaking-panels");
    setProgress(70);
    setStatusMessage("📖 Breaking story into manga panels...");

    try {
      const response = await fetch("/api/break-into-panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          narrative: storyData?.narrative, 
          numberOfPanels,
          characters: characters.map(c => c.name),
          locations: locations.map(l => l.name),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to break into panels");
      }

      const updatedStoryData = storyData ? { ...storyData, panels: data.panels } : null;
      setStoryData(updatedStoryData);
      setProgress(75);
      
      console.log("✅ Panels created:", data.panels?.length);
      
      // Auto-proceed to final step immediately with panel data
      if (updatedStoryData) {
        await handleGeneratePanelImages(updatedStoryData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to break into panels");
    }
  };

  // Step 5: Generate Panel Images
  const handleGeneratePanelImages = async (storyDataParam?: StoryData) => {
    const storyDataToUse = storyDataParam || storyData;
    
    console.log("🎨 handleGeneratePanelImages called!");
    console.log("Story data:", storyDataToUse);
    console.log("Panels:", storyDataToUse?.panels);
    
    setStep("generating-images");
    setProgress(80);
    setStatusMessage("🖼️ Generating manga panel artwork...");

    try {
      if (!storyDataToUse?.panels) {
        console.error("❌ No panels to generate!");
        throw new Error("No panels to generate");
      }
      
      console.log(`🖼️ Generating ${storyDataToUse.panels.length} panel images...`);

      const panelPromises = storyDataToUse.panels.map(async (panel) => {
        // Find relevant character and location references
        const relevantCharImages = characters
          .filter(c => panel.description.toLowerCase().includes(c.name.toLowerCase()))
          .map(c => c.imageUrl)
          .filter(Boolean);

        const relevantLocImages = locations
          .filter(l => panel.description.toLowerCase().includes(l.name.toLowerCase()))
          .map(l => l.imageUrl)
          .filter(Boolean);

        const refImages = [...relevantCharImages, ...relevantLocImages];

        let imageUrl: string | null = null;

        try {
          if (refImages.length > 0) {
            // Use image-to-image with references
            const response = await fetch("/api/edit-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                prompt: `${style} manga panel: ${panel.description}`,
                imageUrls: refImages,
                aspectRatio: "1:1",
              }),
            });
            const data = await response.json();
            if (data.error) {
              console.error(`Panel generation error:`, data.error);
            } else {
              imageUrl = data.imageUrl;
            }
          } else {
            // Use text-to-image
            const response = await fetch("/api/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                prompt: `${style} manga panel: ${panel.description}`,
                aspectRatio: "1:1",
              }),
            });
            const data = await response.json();
            if (data.error) {
              console.error(`Panel generation error:`, data.error);
            } else {
              imageUrl = data.imageUrl;
            }
          }
        } catch (err) {
          console.error(`Panel generation failed:`, err);
        }

        setProgress(prev => Math.min(prev + (15 / storyDataToUse.panels.length), 95));
        return imageUrl;
      });

      const images = await Promise.all(panelPromises);
      
      // Filter out nulls and create panels only for successful images
      const successfulPanels = storyDataToUse.panels
        .map((panel, i) => ({
          imageUrl: images[i],
          text: panel.dialogue,
          order: i + 1,
        }))
        .filter(panel => panel.imageUrl !== null) as { imageUrl: string; text: string; order: number }[];
      
      if (successfulPanels.length === 0) {
        throw new Error("All image generation attempts failed. Please check your FAL_KEY_ID configuration.");
      }
      
      console.log(`✅ Successfully generated ${successfulPanels.length}/${images.length} panels`);
      
      setPanelImages(images.filter(Boolean) as string[]);
      setProgress(95);
      setStatusMessage("💾 Saving chapter to database...");
      
      // Save the chapter to Convex with only successful panels
      await createChapter({
        storyId,
        chapterNumber,
        title: `Chapter ${chapterNumber}`,
        content: storyDataToUse.narrative,
        panels: successfulPanels,
      });
      
      setProgress(100);
      setStep("complete");
      setStatusMessage("🎉 Your manga chapter is complete!");
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate panel images");
    }
  };

  const handleContinue = () => {
    if (step === "story-review") {
      handleExtractElements();
    }
  };

  const genres = [
    { value: "fantasy", label: "Fantasy" },
    { value: "action", label: "Action" },
    { value: "romance", label: "Romance" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "horror", label: "Horror" },
    { value: "comedy", label: "Comedy" },
  ];

  const styles = [
    { value: "manga", label: "Manga (Japanese)" },
    { value: "manhwa", label: "Manhwa (Korean)" },
    { value: "webtoon", label: "Webtoon" },
  ];

  const renderStepIndicator = () => {
    const steps = [
      { id: "input", label: "Story Idea", icon: BookOpen },
      { id: "generating-story", label: "Generate", icon: Wand2 },
      { id: "extracting-elements", label: "Extract", icon: Users },
      { id: "generating-references", label: "References", icon: ImageIcon },
      { id: "generating-images", label: "Artwork", icon: Sparkles },
      { id: "complete", label: "Complete", icon: CheckCircle2 },
    ];

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
  };

  return (
    <GlassCard className="w-full">
      <div className="p-6 md:p-8 space-y-6">
        {renderStepIndicator()}

        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Create Your Manga Story</h2>
                <p className="text-white/80">
                  Describe your idea and watch AI bring it to life with characters, artwork, and panels
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-white font-medium">Story Idea</Label>
                <Textarea
                  id="prompt"
                  placeholder="A young warrior discovers a mystical sword that holds the power to control elements..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-white font-medium">Genre</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style" className="text-white font-medium">Art Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panels" className="text-white font-medium">Panels</Label>
                  <Input
                    id="panels"
                    type="number"
                    min={4}
                    max={12}
                    value={numberOfPanels}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setNumberOfPanels(isNaN(val) ? 8 : val);
                    }}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <Button 
                onClick={handlePlanStory}
                className="w-full h-12"
                size="lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Story
              </Button>
            </motion.div>
          )}

          {/* Step 2: Story Review */}
          {step === "story-review" && storyData && (
            <motion.div
              key="story-review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-500 p-4">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white">✨ Story Generated!</h2>
                <p className="text-white/80 text-lg">Your narrative is ready. Review it below.</p>
              </div>

              <Card className="p-6 bg-white/10 border-white/20 backdrop-blur max-h-96 overflow-y-auto">
                <div className="prose prose-invert max-w-none">
                  <p className="text-white whitespace-pre-wrap leading-relaxed">{storyData.narrative}</p>
                </div>
              </Card>

              <div className="space-y-3">
                <Button 
                  onClick={handleContinue}
                  className="w-full h-14 text-lg"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Continue - Generate Characters & Art
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-center text-white/60 text-sm">
                  Next: AI will extract characters, create references, and generate manga panels
                </p>
              </div>
            </motion.div>
          )}

          {/* Processing Steps */}
          {(step === "generating-story" || 
            step === "extracting-elements" || 
            step === "generating-references" || 
            step === "breaking-panels" || 
            step === "generating-images") && (
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
          )}

          {/* Complete */}
          {step === "complete" && (
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {panelImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image src={img} alt={`Panel ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => window.location.href = `/story/${storyId}`}
                className="w-full h-12"
              >
                View Story & Chapters
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

