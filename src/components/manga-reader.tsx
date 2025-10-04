"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Panel {
  imageUrl: string;
  text?: string;
  order: number;
}

interface MangaReaderProps {
  panels: Panel[];
  currentPanel: number;
  onPanelChange: (panel: number) => void;
}

export function MangaReader({ panels, currentPanel, onPanelChange }: MangaReaderProps) {
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageLoading(true);
  }, [currentPanel]);

  const handlePrev = useCallback(() => {
    if (currentPanel > 0) {
      onPanelChange(currentPanel - 1);
    }
  }, [currentPanel, onPanelChange]);

  const handleNext = useCallback(() => {
    if (currentPanel < panels.length - 1) {
      onPanelChange(currentPanel + 1);
    }
  }, [currentPanel, panels.length, onPanelChange]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrev]);

  const panel = panels[currentPanel];

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        )}
        <Image
          src={panel.imageUrl}
          alt={`Panel ${currentPanel + 1}`}
          fill
          className="object-contain"
          onLoad={() => setImageLoading(false)}
          priority
        />
        {panel.text && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 backdrop-blur-sm">
            <p className="text-center text-lg">{panel.text}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
        onClick={handlePrev}
        disabled={currentPanel === 0}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
        onClick={handleNext}
        disabled={currentPanel === panels.length - 1}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 rounded-full px-4 py-2 backdrop-blur-sm">
        <p className="text-sm font-medium">
          {currentPanel + 1} / {panels.length}
        </p>
      </div>
    </div>
  );
}

