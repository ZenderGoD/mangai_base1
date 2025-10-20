"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MangaGenerationWizard } from "@/components/manga-generation-wizard";
import { GenerationActivityProvider } from "@/components/manga-wizard/hooks/useGenerationActivity";
import { LayeredLayout } from "@/components/manga-wizard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";

export default function GeneratePage() {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  const [storyId, setStoryId] = useState<Id<"stories"> | null>(null);

  // Create a new story for the generated chapter
  const createStory = useMutation(api.stories.create);

  const handleCreateStory = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const newStoryId = await createStory({
      title: "AI Generated Story",
      synopsis: "A story created with AI",
      genre: "fantasy",
      status: "draft",
      visibility: "private",
    });

    setStoryId(newStoryId);
  };

  const handleSuccess = () => {
    // Navigate to the story page which will show all chapters
    router.push(`/story/${storyId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-12 text-center space-y-6">
            <Sparkles className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Sign In Required</h1>
            <p className="text-muted-foreground text-lg">
              Please sign in to use the AI Manga Generator
            </p>
            <Link href="/sign-in">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Sign In to Continue
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold">
              AI Manga Generator
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform your ideas into complete manga chapters
            </p>
          </div>

          {!storyId ? (
            <Card className="p-8 text-center space-y-6">
              <Sparkles className="h-20 w-20 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Ready to Create?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Click below to start generating your manga. The AI will create a complete chapter
                with story, panels, and professional artwork.
              </p>
              <Button 
                onClick={handleCreateStory} 
                size="lg"
                className="gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Start Generating
              </Button>
            </Card>
          ) : (
            <GenerationActivityProvider>
              <LayeredLayout>
                <MangaGenerationWizard
                  storyId={storyId}
                  chapterNumber={1}
                  onSuccess={handleSuccess}
                />
              </LayeredLayout>
            </GenerationActivityProvider>
          )}
        </div>
      </div>
    </div>
  );
}

