"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
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
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function UploadStoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createStory = useMutation(api.stories.create);

  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    genre: "action",
    coverImageUrl: "",
    status: "draft" as "draft" | "published",
    visibility: "public" as "public" | "private" | "unlisted",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const storyId = await createStory({
        title: formData.title,
        synopsis: formData.synopsis || undefined,
        genre: formData.genre,
        coverImageUrl: formData.coverImageUrl || undefined,
        status: formData.status,
        visibility: formData.visibility,
      });

      toast({
        title: "Success!",
        description: "Your story has been created successfully.",
      });

      router.push(`/dashboard/comic-board/${storyId}/add-chapter`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create story",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/comic-board">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Upload New Story</h2>
      </div>

      <Card className="p-6 glass">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Story Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter your story title..."
              className="mt-2"
              required
            />
          </div>

          {/* Synopsis */}
          <div>
            <Label htmlFor="synopsis">Synopsis</Label>
            <Textarea
              id="synopsis"
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              placeholder="Describe your story..."
              rows={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              A brief description of your story (optional)
            </p>
          </div>

          {/* Genre */}
          <div>
            <Label htmlFor="genre">Genre</Label>
            <Select
              value={formData.genre}
              onValueChange={(value) => setFormData({ ...formData, genre: value })}
            >
              <SelectTrigger id="genre" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="drama">Drama</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="horror">Horror</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                <SelectItem value="slice-of-life">Slice of Life</SelectItem>
                <SelectItem value="supernatural">Supernatural</SelectItem>
                <SelectItem value="thriller">Thriller</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cover Image */}
          <div>
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="https://example.com/cover.jpg"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Paste a URL to your cover image (optional)
            </p>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "draft" | "published") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Published stories will be visible to others
            </p>
          </div>

          {/* Visibility */}
          <div>
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: "public" | "private" | "unlisted") =>
                setFormData({ ...formData, visibility: value })
              }
            >
              <SelectTrigger id="visibility" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can find it</SelectItem>
                <SelectItem value="unlisted">Unlisted - Only with link</SelectItem>
                <SelectItem value="private">Private - Only you</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isUploading} className="flex-1">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Story...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Create Story & Add Chapters
                </>
              )}
            </Button>
            <Link href="/dashboard/comic-board">
              <Button type="button" variant="outline" disabled={isUploading}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {/* Info Card */}
      <Card className="p-6 glass">
        <h3 className="font-semibold mb-3">📝 Next Steps</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• After creating your story, you&apos;ll be able to add chapters</li>
          <li>• You can upload multiple panels per chapter</li>
          <li>• Add dialogue, narration, and panel descriptions</li>
          <li>• Edit or delete chapters anytime from your Comic Board</li>
          <li>• Track analytics and engagement for each story</li>
        </ul>
      </Card>
    </div>
  );
}

