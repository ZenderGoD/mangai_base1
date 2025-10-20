"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { GlassCard } from "@/components/ui/glass-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
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
import { Loader2, Sparkles, BookOpen, Image as ImageIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MangaGeneratorProps {
  storyId: Id<"stories">;
  chapterNumber: number;
  onSuccess?: (chapterId: Id<"chapters">) => void;
}

export function MangaGenerator({ storyId, chapterNumber, onSuccess }: MangaGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("fantasy");
  const [style, setStyle] = useState("manga");
  const [colorMode, setColorMode] = useState<"color" | "black-and-white">("color");
  const [numberOfPanels, setNumberOfPanels] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const generateManga = useAction(api.aiGenerator.generateMangaChapter);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a story idea");
      return;
    }

    setIsGenerating(true);
    setError("");
    setProgress(0);
    setStatusMessage("Starting manga generation...");

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 2000);

      const result = await generateManga({
        storyId,
        prompt,
        chapterNumber,
        genre,
        style,
        numberOfPanels,
        colorMode,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Manga chapter created successfully!");

      if (result.success && onSuccess) {
        setTimeout(() => {
          onSuccess(result.chapterId);
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate manga");
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const genres = [
    { value: "fantasy", label: "Fantasy" },
    { value: "action", label: "Action" },
    { value: "romance", label: "Romance" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "horror", label: "Horror" },
    { value: "comedy", label: "Comedy" },
    { value: "drama", label: "Drama" },
    { value: "adventure", label: "Adventure" },
  ];

  const styles = [
    { value: "manga", label: "Manga (Japanese)" },
    { value: "manhwa", label: "Manhwa (Korean)" },
    { value: "manhua", label: "Manhua (Chinese)" },
    { value: "webtoon", label: "Webtoon" },
    { value: "comic", label: "Western Comic" },
  ];

  const colorModes = [
    { value: "color", label: "Color" },
    { value: "black-and-white", label: "Black & White" },
  ];

  return (
    <GlassCard className="w-full" blur="xl" opacity={0.15}>
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Sparkles className="h-6 sm:h-7 w-6 sm:w-7 text-white" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">AI Manga Generator</h2>
          </div>
          <p className="text-sm sm:text-base text-white/80 px-2">
            Drop your story idea and let AI create a complete manga chapter with artwork
          </p>
        </div>

        {/* Story Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-white font-medium">Story Idea or Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Example: A young wizard discovers a magical artifact that can control time. They must learn to master its power before evil forces steal it..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            disabled={isGenerating}
            className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
          />
          <p className="text-sm text-white/60">
            Describe your story idea, plot points, characters, or scenes you want to include.
          </p>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="genre" className="text-white font-medium text-sm sm:text-base">Genre</Label>
            <Select value={genre} onValueChange={setGenre} disabled={isGenerating}>
              <SelectTrigger id="genre" className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genres.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style" className="text-white font-medium text-sm sm:text-base">Art Style</Label>
            <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
              <SelectTrigger id="style" className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorMode" className="text-white font-medium text-sm sm:text-base">Color Mode</Label>
            <Select value={colorMode} onValueChange={(value: "color" | "black-and-white") => setColorMode(value)} disabled={isGenerating}>
              <SelectTrigger id="colorMode" className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <Label htmlFor="panels" className="text-white font-medium text-sm sm:text-base">Number of Panels</Label>
            <Input
              id="panels"
              type="number"
              min={4}
              max={16}
              value={numberOfPanels}
              onChange={(e) => setNumberOfPanels(parseInt(e.target.value) || 8)}
              disabled={isGenerating}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>

        {/* Progress */}
        {isGenerating && (
          <GlassCard className="p-4 sm:p-6 space-y-3 sm:space-y-4" blur="lg" opacity={0.1}>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-white font-medium truncate mr-2">{statusMessage}</span>
              <span className="font-bold text-white flex-shrink-0">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 sm:h-3" />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-white/70 animate-pulse flex-shrink-0" />
                <span className="text-white/70">Generating story...</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <ImageIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white/70 animate-pulse flex-shrink-0" />
                <span className="text-white/70">Creating panels...</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-white/70 animate-pulse flex-shrink-0" />
                <span className="text-white/70">Adding artwork...</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Error */}
        {error && (
          <GlassCard className="p-4" blur="md" opacity={0.2}>
            <p className="text-sm text-red-300 font-medium">{error}</p>
          </GlassCard>
        )}

        {/* Generate Button */}
        <ShimmerButton
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-4 sm:py-6 text-base sm:text-lg font-semibold"
          background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          shimmerColor="#ffffff"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 sm:h-6 w-5 sm:w-6 animate-spin" />
              <span className="hidden sm:inline">Generating Manga Chapter...</span>
              <span className="sm:hidden">Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 sm:h-6 w-5 sm:w-6" />
              <span className="hidden sm:inline">Generate Complete Chapter</span>
              <span className="sm:hidden">Generate Chapter</span>
            </>
          )}
        </ShimmerButton>

        {/* Info */}
        <GlassCard className="p-4 sm:p-6 space-y-2 sm:space-y-3" blur="md" opacity={0.1}>
          <h4 className="font-semibold text-white text-sm sm:text-base">How it works:</h4>
          <ul className="text-xs sm:text-sm text-white/70 space-y-1.5 sm:space-y-2 list-disc list-inside">
            <li>AI writes a complete narrative based on your idea</li>
            <li>Story is broken down into visual manga panels</li>
            <li>Each panel gets professional artwork generated</li>
            <li>Dialogue and scenes are automatically placed</li>
            <li>Complete chapter is ready to read in minutes!</li>
          </ul>
          <p className="text-xs text-white/50 italic mt-3 sm:mt-4">
            Generation typically takes 3-5 minutes depending on the number of panels
          </p>
        </GlassCard>
      </div>
    </GlassCard>
  );
}

