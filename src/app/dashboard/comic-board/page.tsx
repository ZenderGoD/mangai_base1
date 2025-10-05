"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Plus,
  BookOpen,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ComicBoardPage() {
  const viewer = useQuery(api.users.getCurrentUser);
  const myStories = useQuery(api.stories.getMyStories);
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!viewer) {
    return (
      <Card className="p-8 glass text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </Card>
    );
  }

  const totalViews = myStories?.reduce((acc, story) => acc + (story.viewCount || 0), 0) || 0;
  const totalLikes = myStories?.reduce((acc, story) => acc + (story.likeCount || 0), 0) || 0;
  const totalComments = myStories?.reduce((acc, story) => acc + (story.commentCount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Comic Board</h2>
        <Link href="/dashboard/comic-board/upload">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload Story
          </Button>
        </Link>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Stories</div>
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold">{myStories?.length || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </Card>

        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Views</div>
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold">{totalViews.toLocaleString()}</div>
          <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +12% this week
          </p>
        </Card>

        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Likes</div>
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold">{totalLikes.toLocaleString()}</div>
          <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +8% this week
          </p>
        </Card>

        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Comments</div>
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold">{totalComments.toLocaleString()}</div>
          <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +15% this week
          </p>
        </Card>
      </div>

      {/* Detailed View */}
      <Card className="p-6 glass">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stories">My Stories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              {!myStories || myStories.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No stories yet</p>
                  <Link href="/dashboard/comic-board/upload">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Your First Story
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myStories.slice(0, 5).map((story) => (
                    <div
                      key={story._id}
                      className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg"
                    >
                      {story.coverImageUrl && (
                        <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={story.coverImageUrl}
                            alt={story.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{story.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {story.chapterCount || 0} chapters • {story.viewCount || 0} views
                        </p>
                      </div>
                      <Link href={`/story/${story._id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">All Stories</h3>
              <Link href="/dashboard/comic-board/upload">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Story
                </Button>
              </Link>
            </div>

            {!myStories || myStories.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No stories yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myStories.map((story) => (
                  <Card key={story._id} className="p-4 glass">
                    <div className="flex gap-4">
                      {story.coverImageUrl && (
                        <div className="relative w-24 h-32 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={story.coverImageUrl}
                            alt={story.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{story.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {story.synopsis || "No description"}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {story.chapterCount || 0} chapters
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {story.viewCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {story.likeCount || 0}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/story/${story._id}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              View
                            </Button>
                          </Link>
                          <Link href={`/dashboard/comic-board/${story._id}/edit`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
              <div className="space-y-4">
                <Card className="p-4 glass">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Views Over Time</h4>
                  </div>
                  <div className="h-48 flex items-center justify-center bg-secondary/50 rounded">
                    <p className="text-muted-foreground">Chart coming soon</p>
                  </div>
                </Card>

                <Card className="p-4 glass">
                  <h4 className="font-semibold mb-3">Top Performing Stories</h4>
                  {!myStories || myStories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data available</p>
                  ) : (
                    <div className="space-y-2">
                      {myStories
                        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                        .slice(0, 3)
                        .map((story, index) => (
                          <div
                            key={story._id}
                            className="flex items-center justify-between p-3 bg-secondary/50 rounded"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-bold text-primary">#{index + 1}</div>
                              <div>
                                <p className="font-medium">{story.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {story.viewCount || 0} views
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

