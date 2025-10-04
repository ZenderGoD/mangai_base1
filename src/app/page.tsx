"use client";

import { StoryCard } from "@/components/story-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, TrendingUp, Search } from "lucide-react";
import Link from "next/link";
import Particles from "@/components/ui/particles";
import { Meteors } from "@/components/ui/meteors";
import { BorderBeam } from "@/components/ui/border-beam";
import Ripple from "@/components/ui/ripple";
import TextShimmer from "@/components/ui/text-shimmer";
import { DotPattern } from "@/components/ui/dot-pattern";

const genres = ["Fantasy", "Romance", "Action", "Mystery", "Sci-Fi", "Horror", "Comedy", "Drama"];

const featuredStories = [
  {
    id: "1",
    title: "The Dragon's Promise",
    description: "A young warrior must form an unlikely alliance with a dragon to save their kingdom from an ancient evil.",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop",
    genre: "Fantasy",
    author: "AI Creator",
    likes: 1234,
    views: 5678,
    chapters: 12,
  },
  {
    id: "2",
    title: "Neon Nights",
    description: "In a cyberpunk future, a hacker discovers a conspiracy that threatens humanity's existence.",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=600&fit=crop",
    genre: "Sci-Fi",
    author: "AI Creator",
    likes: 987,
    views: 3456,
    chapters: 8,
  },
  {
    id: "3",
    title: "Whispers in the Dark",
    description: "A detective investigates mysterious disappearances in a small town with a dark secret.",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
    genre: "Mystery",
    author: "AI Creator",
    likes: 756,
    views: 2890,
    chapters: 10,
  },
  {
    id: "4",
    title: "Hearts in Bloom",
    description: "Two strangers find love in the most unexpected place - a magical garden that only appears at twilight.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
    genre: "Romance",
    author: "AI Creator",
    likes: 2341,
    views: 8901,
    chapters: 15,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Magic UI Effects */}
      <section className="relative border-b overflow-hidden">
        <DotPattern className="opacity-50" />
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color="#9333ea"
          refresh={false}
        />
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center relative z-10">
          <div className="relative inline-block mb-6">
            <Ripple />
            <Sparkles className="h-16 w-16 text-primary relative z-10" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Manga Stories
          </h1>
          <TextShimmer className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Discover and create infinite manga stories powered by AI. 
            Let your imagination run wild with our story generation tools.
          </TextShimmer>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/generate">
              <div className="relative">
                <Button size="lg" className="gap-2 relative z-10">
                  <Sparkles className="h-5 w-5" />
                  Generate Manga
                </Button>
                <BorderBeam size={250} duration={12} delay={9} />
              </div>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-5 w-5" />
                Explore Stories
              </Button>
            </Link>
          </div>
        </div>
        <Meteors number={30} />
      </section>

      {/* Search and Filters */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for stories..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {genres.map((genre) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="trending" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="trending" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="new" className="gap-2">
                <Sparkles className="h-4 w-4" />
                New
              </TabsTrigger>
              <TabsTrigger value="popular" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Popular
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredStories.slice().reverse().map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...featuredStories].sort((a, b) => b.likes - a.likes).map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Call to Action with Magic UI */}
      <section className="relative border-t overflow-hidden">
        <Particles
          className="absolute inset-0"
          quantity={50}
          ease={70}
          color="#ec4899"
          refresh={false}
        />
        <div className="container mx-auto px-4 py-16 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ready to Create Your Story?
          </h2>
          <TextShimmer className="mb-8 max-w-xl mx-auto text-base sm:text-lg">
            Use our AI-powered tools to generate compelling manga stories and beautiful artwork.
          </TextShimmer>
          <Link href="/generate">
            <div className="relative inline-block">
              <Button size="lg" className="gap-2 relative z-10">
                <Sparkles className="h-5 w-5" />
                Start Creating
              </Button>
              <BorderBeam size={200} duration={10} delay={5} />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
