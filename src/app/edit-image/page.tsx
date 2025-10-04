"use client";

import { ImageEditor } from "@/components/image-editor";
import { useQuery } from "convex/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { api } from "../../../convex/_generated/api";

export default function EditImagePage() {
  const viewer = useQuery(api.users.getCurrentUser);

  if (viewer === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!viewer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 glass text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to use the image editor
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-in">
                <Button>Sign In</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
            AI Image Editor
          </h1>
          <p className="text-muted-foreground">
            Edit and enhance your manga images with AI-powered transformations
          </p>
        </div>

        <ImageEditor />

        <Card className="mt-8 p-6 glass">
          <h3 className="font-semibold mb-3">Tips for Best Results:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Be specific about what you want to change</li>
            <li>• Use multiple reference images for more context</li>
            <li>• Try prompts like &quot;add manga-style speed lines&quot; or &quot;enhance dramatic shadows&quot;</li>
            <li>• Experiment with different aspect ratios for different compositions</li>
            <li>• The AI understands style instructions like &quot;black and white manga&quot;, &quot;anime style&quot;, etc.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

