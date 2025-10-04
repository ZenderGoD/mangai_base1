"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Eye, Share2, BookOpen, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function StoryPage() {
  const params = useParams();
  const storyId = params.id as Id<"stories">;
  
  // React Hooks must be called at the top level
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  // Fetch story and chapters from Convex
  const storyData = useQuery(api.stories.getStory, { storyId });
  
  if (!storyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  const { chapters, ...story } = storyData;

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold">No chapters yet</p>
          <p className="text-muted-foreground">This story does not have any chapters yet.</p>
        </div>
      </div>
    );
  }

  const chapter = chapters[currentChapter];
  const totalPanels = chapter.panels?.length || 0;

  const nextPanel = () => {
    if (currentPanel < totalPanels - 1) {
      setCurrentPanel(currentPanel + 1);
    } else if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPanel(0);
    }
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      setCurrentPanel(currentPanel - 1);
    } else if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setCurrentPanel(chapters[currentChapter - 1].panels?.length - 1 || 0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Story Header */}
          <div className="mb-8">
            <div className="flex gap-6 flex-col md:flex-row">
              <div className="relative w-full md:w-64 aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                {chapters[0]?.panels?.[0]?.imageUrl ? (
                  <Image
                    src={chapters[0].panels[0].imageUrl}
                    alt={story.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No cover image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{story.title}</h1>
                  <Badge className="mb-4">{story.genre}</Badge>
                  <p className="text-muted-foreground">{story.synopsis || "No description available"}</p>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={story.author?.imageUrl} />
                    <AvatarFallback>{story.author?.username?.[0] || "A"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{story.author?.username || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span>{(story.likeCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-5 w-5" />
                    <span>{(story.viewCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-5 w-5" />
                    <span>{chapters.length} Chapters</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsLiked(!isLiked)}
                    variant={isLiked ? "default" : "outline"}
                    className="gap-2"
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Reader Tabs */}
          <Tabs defaultValue="read" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="read">Read</TabsTrigger>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="read" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  {/* Manga Reader */}
                  <div className="relative">
                    <div className="relative aspect-[4/3] bg-black rounded-t-lg overflow-hidden">
                      {chapter.panels?.[currentPanel]?.imageUrl ? (
                        <Image
                          src={chapter.panels[currentPanel].imageUrl}
                          alt={`Panel ${currentPanel + 1}`}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white">
                          No image available
                        </div>
                      )}
                      {chapter.panels?.[currentPanel]?.text && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4">
                          <p className="text-center">{chapter.panels[currentPanel].text}</p>
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={prevPanel}
                      disabled={currentChapter === 0 && currentPanel === 0}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={nextPanel}
                      disabled={
                        currentChapter === chapters.length - 1 &&
                        currentPanel === totalPanels - 1
                      }
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Reader Controls */}
                  <div className="p-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Panel {currentPanel + 1} / {totalPanels}
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${((currentPanel + 1) / totalPanels) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chapters" className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {chapters.map((ch, idx) => (
                    <Card
                      key={ch._id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        idx === currentChapter ? "border-primary" : ""
                      }`}
                      onClick={() => {
                        setCurrentChapter(idx);
                        setCurrentPanel(0);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Chapter {ch.chapterNumber}</p>
                            <p className="text-sm text-muted-foreground">{ch.title}</p>
                          </div>
                          <Badge variant="outline">{ch.panels?.length || 0} panels</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

