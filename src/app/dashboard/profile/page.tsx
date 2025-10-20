"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Save, 
  User as UserIcon, 
  Eye, 
  ExternalLink,
  BookOpen,
  Heart,
  Edit,
  Settings,
  Award,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const viewer = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const myStories = useQuery(api.stories.getMyStories);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    image: "",
  });

  // Initialize form data when viewer loads
  useEffect(() => {
    if (viewer) {
      setFormData({
        name: viewer.name || "",
        username: viewer.username || "",
        bio: viewer.bio || "",
        image: viewer.image || "",
      });
    }
  }, [viewer]);

  const handleSave = async () => {
    if (!viewer) return;

    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name || undefined,
        username: formData.username || undefined,
        bio: formData.bio || undefined,
        image: formData.image || undefined,
      });

      toast({
        title: "Profile Updated",
        description: "Your creator profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const publishedStories = myStories?.filter(s => s.status === "published") || [];
  const totalViews = myStories?.reduce((acc, story) => acc + (story.viewCount || 0), 0) || 0;
  const totalLikes = myStories?.reduce((acc, story) => acc + (story.likeCount || 0), 0) || 0;
  const totalComments = myStories?.reduce((acc, s) => acc + (s.commentCount || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your creator profile and view your statistics</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/creator/${viewer.username || viewer._id}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Preview
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "secondary" : "default"}
            size="sm"
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Card */}
          <Card className="p-6 text-center">
            <div className="space-y-4">
              <Avatar className="h-24 w-24 mx-auto ring-4 ring-primary/20">
                <AvatarImage src={viewer.image} alt={viewer.name || "User"} />
                <AvatarFallback className="text-2xl">
                  {viewer.name?.charAt(0)?.toUpperCase() || <UserIcon className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-xl font-bold">{viewer.name || "Creator"}</h2>
                <p className="text-sm text-muted-foreground">@{viewer.username || "username"}</p>
              </div>

              {viewer.bio && (
                <p className="text-sm text-muted-foreground">{viewer.bio}</p>
              )}

              <div className="flex items-center justify-center gap-4 text-sm">
                <Badge variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  Creator
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Member since Oct 2024
                </Badge>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stories</span>
                <span className="font-semibold">{publishedStories.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <span className="font-semibold">{totalViews.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Likes</span>
                <span className="font-semibold">{totalLikes.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Comments</span>
                <span className="font-semibold">{totalComments.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/comic-board/upload" className="w-full">
                <Button className="w-full justify-start" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Story
                </Button>
              </Link>
              <Link href="/dashboard/settings" className="w-full">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Form */}
          {isEditing && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Edit Profile</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.image} alt={formData.name || "User"} />
                    <AvatarFallback className="text-lg">
                      {formData.name?.charAt(0)?.toUpperCase() || <UserIcon className="h-10 w-10" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="image">Profile Picture URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your display name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="@username"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell your story... What kind of manga do you create? What inspires you?"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.bio.length}/150 characters
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: viewer.name || "",
                        username: viewer.username || "",
                        bio: viewer.bio || "",
                        image: viewer.image || "",
                      });
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Stories */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Stories
              </h3>
              <Link href="/dashboard/comic-board/upload">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Story
                </Button>
              </Link>
            </div>

            {myStories?.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold text-lg mb-2">No Stories Yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Start creating your first manga story to share with the world!
                </p>
                <Link href="/dashboard/comic-board/upload">
                  <Button>Create Your First Story</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myStories?.slice(0, 5).map((story) => (
                  <div key={story._id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    {story.coverImageUrl ? (
                      <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={story.coverImageUrl}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-20 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{story.title}</h4>
                        <Badge variant={story.status === "published" ? "default" : "secondary"} className="text-xs">
                          {story.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {story.synopsis || "No description"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {story.chapterCount || 0} chapters
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {story.viewCount || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {story.likeCount || 0} likes
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/story/${story._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {myStories && myStories.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/dashboard/comic-board">
                      <Button variant="outline" size="sm">
                        View All Stories ({myStories.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Performance Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{totalViews.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500 mb-1">{totalLikes.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">{totalComments.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Comments</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500 mb-1">
                  {publishedStories.length > 0 ? Math.round(totalLikes / publishedStories.length) : 0}
                </div>
                <p className="text-sm text-muted-foreground">Avg. Likes/Story</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
