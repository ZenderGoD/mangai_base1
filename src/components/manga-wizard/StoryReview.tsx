"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { StoryData } from "./types";

interface StoryReviewProps {
  storyData: StoryData;
  editSelection: string;
  setEditSelection: (selection: string) => void;
  editInput: string;
  setEditInput: (input: string) => void;
  isRewriting: boolean;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  onContinue: () => void;
  onRetryStory: () => void;
  onRewrite: () => void;
}

export function StoryReview({
  storyData,
  editSelection,
  setEditSelection,
  editInput,
  setEditInput,
  isRewriting,
  isEditDialogOpen,
  setIsEditDialogOpen,
  onContinue,
  onRetryStory,
  onRewrite,
}: StoryReviewProps) {
  
  const captureSelection = () => {
    try {
      const sel = window.getSelection()?.toString() || "";
      setEditSelection(sel);
      if (sel) setIsEditDialogOpen(true);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-500 p-4">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white">✨ Story Generated!</h2>
        <p className="text-white/80 text-lg">Your narrative is ready. Review it below.</p>
      </div>

      <Card className="p-0 bg-background/50 border-border backdrop-blur">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Click and drag to select text. Use the toolbar to edit.</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={editSelection ? "default" : "outline"}
              disabled={!editSelection}
              onClick={() => setIsEditDialogOpen(true)}
            >
              Edit Selection
            </Button>
            <Button size="sm" variant="outline" onClick={onRetryStory}>Retry Story</Button>
          </div>
        </div>
        <ScrollArea className="h-96 w-full">
          <div className="px-6 py-5" onMouseUp={captureSelection}>
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed select-text break-words">{storyData.narrative}</p>
            </div>
          </div>
        </ScrollArea>
        {editSelection && (
          <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground flex items-center justify-between">
            <span className="line-clamp-1">Selected: &ldquo;{editSelection.slice(0, 140)}{editSelection.length > 140 ? "…" : ""}&rdquo;</span>
            <Button size="sm" variant="ghost" onClick={() => setEditSelection("")}>Clear</Button>
          </div>
        )}
      </Card>

      <div className="space-y-3">
        <Button 
          onClick={onContinue}
          className="w-full h-14 text-lg"
          size="lg"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Continue - Generate Characters & Art
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
        <p className="text-center text-muted-foreground text-sm">
          Next: AI will extract characters, create references, and generate manga panels
        </p>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
            <DialogDescription>
              Make a precise change. The AI will rewrite the chapter coherently around your edit.
            </DialogDescription>
          </DialogHeader>
          {editSelection && (
            <div className="bg-muted rounded-md p-3 text-xs text-muted-foreground border border-border">
              <p className="font-medium text-foreground mb-1">Selected:</p>
              <p className="line-clamp-3">{editSelection}</p>
            </div>
          )}
          <div className="space-y-2 mt-3">
            <Label className="text-foreground">Instruction</Label>
            <Textarea
              placeholder="E.g., Soften Mei's tone in the apology scene and add a witty line."
              value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={onRewrite} disabled={isRewriting}>
              {isRewriting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Apply Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
