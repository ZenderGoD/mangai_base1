"use client";

import { useState } from "react";
import { StoryCard } from "@/components/story-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const genres = ["All", "Fantasy", "Romance", "Action", "Mystery", "Sci-Fi", "Horror", "Comedy", "Drama"];

const allStories = [
  {
    id: "1",
    title: "The Dragon's Promise",
    description: "A young warrior must form an unlikely alliance with a dragon to save their kingdom.",
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
    description: "A hacker discovers a conspiracy that threatens humanity's existence.",
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
    description: "A detective investigates mysterious disappearances in a small town.",
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
    description: "Two strangers find love in a magical garden that only appears at twilight.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
    genre: "Romance",
    author: "AI Creator",
    likes: 2341,
    views: 8901,
    chapters: 15,
  },
  {
    id: "5",
    title: "Shadow Warriors",
    description: "Elite fighters must protect the world from supernatural threats.",
    coverImage: "https://images.unsplash.com/photo-1589241062272-c0a000072e0b?w=400&h=600&fit=crop",
    genre: "Action",
    author: "AI Creator",
    likes: 1567,
    views: 4532,
    chapters: 20,
  },
  {
    id: "6",
    title: "Midnight Laughter",
    description: "A comedian discovers they have the power to make wishes come true through jokes.",
    coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=600&fit=crop",
    genre: "Comedy",
    author: "AI Creator",
    likes: 892,
    views: 2134,
    chapters: 7,
  },
];

export default function ExplorePage() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "trending">("popular");

  const filteredStories = allStories
    .filter((story) => {
      const matchesGenre = selectedGenre === "All" || story.genre === selectedGenre;
      const matchesSearch =
        searchQuery === "" ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.likes - a.likes;
      if (sortBy === "trending") return b.views - a.views;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Stories</h1>
          <p className="text-muted-foreground">
            Discover thousands of AI-generated manga stories
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={sortBy === "popular"}
                  onCheckedChange={() => setSortBy("popular")}
                >
                  Most Popular
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "trending"}
                  onCheckedChange={() => setSortBy("trending")}
                >
                  Trending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "recent"}
                  onCheckedChange={() => setSortBy("recent")}
                >
                  Most Recent
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Genre Filter */}
          <div className="flex gap-2 flex-wrap">
            {genres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredStories.length} {filteredStories.length === 1 ? "story" : "stories"}
          </p>
        </div>

        {/* Story Grid */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No stories found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

