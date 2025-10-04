"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Download, RefreshCw } from "lucide-react";
import Image from "next/image";

interface ImageEditorProps {
  initialImageUrl?: string;
  onEditComplete?: (editedImageUrl: string) => void;
}

export function ImageEditor({ initialImageUrl, onEditComplete }: ImageEditorProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrl ? [initialImageUrl] : []);
  const [editPrompt, setEditPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [isEditing, setIsEditing] = useState(false);
  const [editedImages, setEditedImages] = useState<Array<{ url: string; description: string }>>([]);
  const [error, setError] = useState("");

  const handleAddImageUrl = (url: string) => {
    if (url && !imageUrls.includes(url)) {
      setImageUrls([...imageUrls, url]);
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleEdit = async () => {
    if (!editPrompt.trim()) {
      setError("Please enter an edit prompt");
      return;
    }

    if (imageUrls.length === 0) {
      setError("Please provide at least one image URL");
      return;
    }

    setIsEditing(true);
    setError("");
    setEditedImages([]);

    try {
      const response = await fetch("/api/edit-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: editPrompt,
          imageUrls,
          aspectRatio,
          numImages: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit image");
      }

      const data = await response.json();
      setEditedImages(data.images.map((img: { url: string }) => ({
        url: img.url,
        description: data.description,
      })));

      if (onEditComplete && data.images.length > 0) {
        onEditComplete(data.images[0].url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit image");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 glass">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Image Editor
        </h3>

        <div className="space-y-4">
          {/* Image URLs Input */}
          <div>
            <Label htmlFor="imageUrl">Image URLs</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddImageUrl(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const input = document.getElementById("imageUrl") as HTMLInputElement;
                  handleAddImageUrl(input.value);
                  input.value = "";
                }}
              >
                Add
              </Button>
            </div>
            {imageUrls.length > 0 && (
              <div className="mt-3 space-y-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                    <span className="text-sm flex-1 truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImageUrl(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Prompt */}
          <div>
            <Label htmlFor="editPrompt">Edit Instructions</Label>
            <Textarea
              id="editPrompt"
              placeholder="Describe how you want to edit the image... (e.g., 'add dramatic manga-style speed lines', 'enhance the shadows and contrast', 'make it black and white manga style')"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <Label htmlFor="aspectRatio">Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger id="aspectRatio" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Edit Button */}
          <Button
            onClick={handleEdit}
            disabled={isEditing || !editPrompt.trim() || imageUrls.length === 0}
            className="w-full"
            size="lg"
          >
            {isEditing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Editing Image...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Edit Image
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Edited Images Display */}
      {editedImages.length > 0 && (
        <Card className="p-6 glass">
          <h3 className="text-lg font-semibold mb-4">Edited Images</h3>
          <div className="space-y-4">
            {editedImages.map((image, index) => (
              <div key={index} className="space-y-3">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                  <Image
                    src={image.url}
                    alt={`Edited image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                {image.description && (
                  <p className="text-sm text-muted-foreground">{image.description}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(image.url, "_blank")}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

