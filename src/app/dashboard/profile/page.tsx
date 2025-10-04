"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Save, 
  User as UserIcon, 
  Eye, 
  ExternalLink,
  Grid3x3,
  BookOpen,
  Heart,
  MessageSquare,
  UserPlus,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import { BorderBeam } from "@/components/ui/border-beam";
import TextShimmer from "@/components/ui/text-shimmer";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";

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
      <Card className="p-8 glass text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </Card>
    );
  }

  const publishedStories = myStories?.filter(s => s.status === "published") || [];
  const totalViews = myStories?.reduce((acc, story) => acc + (story.viewCount || 0), 0) || 0;
  const totalLikes = myStories?.reduce((acc, story) => acc + (story.likeCount || 0), 0) || 0;
  
  // Mock data for followers/following (will be implemented with social features)
  const followerCount = viewer.followerCount || 0;
  const followingCount = viewer.followingCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Creator Profile</h2>
        <Link href={`/creator/${viewer.username || viewer._id}`} target="_blank">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View Public Profile
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Card className="p-6 glass">
        <div className="max-w-4xl mx-auto">
          {/* Edit Mode Toggle */}
          <div className="flex justify-end mb-6">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-3">
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
              </div>
            )}
          </div>

          {/* Edit Mode - Show Form Fields */}
          {isEditing && (
            <div className="space-y-6 mb-8 pb-8 border-b">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-32 w-32 mb-4 ring-4 ring-primary/20">
                  <AvatarImage src={formData.image} alt={formData.name || "User"} />
                  <AvatarFallback className="text-2xl">
                    {formData.name?.charAt(0)?.toUpperCase() || <UserIcon className="h-16 w-16" />}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full max-w-md">
                  <Label htmlFor="image">Profile Picture URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be displayed on your public profile
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                <div>
                  <Label htmlFor="name">Name</Label>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Your unique username for your profile URL
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={5}
                    placeholder="Tell your story... What kind of manga do you create? What inspires you?"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.bio.length}/150 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Preview - Always Visible */}
          <div>
            {/* Header Section - Centered & Clean */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center mb-8 pb-8 border-b"
            >
              {/* Profile Picture with BorderBeam */}
              <div className="relative mb-6">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-primary/20">
                  <AvatarImage src={viewer.image} alt={viewer.name || "User"} />
                  <AvatarFallback className="text-3xl md:text-4xl">
                    {viewer.name?.charAt(0)?.toUpperCase() || <UserIcon className="h-20 w-20" />}
                  </AvatarFallback>
                </Avatar>
                <BorderBeam size={250} duration={12} delay={9} />
              </div>

              {/* Username with Shimmer */}
              <div className="mb-4">
                <TextShimmer className="text-3xl font-bold mb-2" as="h1">
                  {viewer.username || "username"}
                </TextShimmer>
                <p className="text-lg font-semibold text-white/90">{viewer.name || "Creator Name"}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <ShimmerButton className="h-10 px-6">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Follow
                </ShimmerButton>
                <Button size="default" variant="outline">
                  Message
                </Button>
              </div>

              {/* Stats Row - Clean & Spaced */}
              <div className="flex gap-8 mb-6 justify-center">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center hover:opacity-70 transition-opacity"
                >
                  <span className="font-bold text-2xl block mb-1">{publishedStories.length}</span>
                  <span className="text-sm text-muted-foreground uppercase tracking-wide">posts</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center hover:opacity-70 transition-opacity"
                >
                  <span className="font-bold text-2xl block mb-1">{followerCount}</span>
                  <span className="text-sm text-muted-foreground uppercase tracking-wide">followers</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center hover:opacity-70 transition-opacity"
                >
                  <span className="font-bold text-2xl block mb-1">{followingCount}</span>
                  <span className="text-sm text-muted-foreground uppercase tracking-wide">following</span>
                </motion.button>
              </div>

              {/* Bio */}
              {viewer.bio && (
                <p className="text-sm text-muted-foreground max-w-2xl whitespace-pre-wrap">
                  {viewer.bio}
                </p>
              )}
            </motion.div>

            {/* Engagement Stats - Compact & Beautiful */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5 rounded-xl relative overflow-hidden"
            >
              <BorderBeam size={200} duration={10} delay={2} />
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.08, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Eye className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-white mb-1">{totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Views</p>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.08, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Heart className="h-6 w-6 mx-auto mb-2 text-pink-500" />
                <div className="text-2xl font-bold text-white mb-1">{totalLikes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Likes</p>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.08, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-white mb-1">
                  {(myStories?.reduce((acc, s) => acc + (s.commentCount || 0), 0) || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Comments</p>
              </motion.div>
            </motion.div>

            {/* Content Tabs - Social Media Style */}
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start border-t">
                <TabsTrigger value="posts" className="flex-1 gap-2">
                  <Grid3x3 className="h-4 w-4" />
                  POSTS
                </TabsTrigger>
                <TabsTrigger value="stories" className="flex-1 gap-2">
                  <BookOpen className="h-4 w-4" />
                  STORIES
                </TabsTrigger>
                <TabsTrigger value="liked" className="flex-1 gap-2">
                  <Heart className="h-4 w-4" />
                  LIKED
                </TabsTrigger>
              </TabsList>

              {/* Posts Grid - Social Media Style */}
              <TabsContent value="posts" className="mt-6">
                {publishedStories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center mb-4">
                      <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-lg mb-2">No Posts Yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start creating manga stories to share with your followers!
                    </p>
                    <Link href="/dashboard/comic-board/upload">
                      <Button>Create Your First Story</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 md:gap-2">
                    {publishedStories.map((story, index) => (
                      <motion.div
                        key={story._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Link
                          href={`/story/${story._id}`}
                          className="group relative aspect-square overflow-hidden bg-secondary rounded-sm block"
                        >
                        {story.coverImageUrl ? (
                          <Image
                            src={story.coverImageUrl}
                            alt={story.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Hover Overlay - Social Media Style */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                          <div className="flex items-center gap-2 text-white">
                            <Heart className="h-5 w-5 fill-white" />
                            <span className="font-semibold">{story.likeCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white">
                            <MessageSquare className="h-5 w-5 fill-white" />
                            <span className="font-semibold">{story.commentCount || 0}</span>
                          </div>
                        </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Stories Tab */}
              <TabsContent value="stories" className="mt-6">
                <div className="space-y-4">
                  {myStories?.map((story) => (
                    <Link key={story._id} href={`/story/${story._id}`}>
                      <Card className="p-4 glass hover:border-primary transition-colors">
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
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {story.synopsis || "No description"}
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
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
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              {/* Liked Tab */}
              <TabsContent value="liked" className="mt-6">
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Liked stories will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
}
