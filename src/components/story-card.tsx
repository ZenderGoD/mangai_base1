"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface StoryCardProps {
  story: {
    _id: string;
    title: string;
    description: string;
    coverImageUrl?: string;
    genre: string;
    author: {
      username: string;
      imageUrl?: string;
    } | null;
    likeCount: number;
    viewCount: number;
    chapterCount: number;
  };
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link href={`/story/${story._id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-105 cursor-pointer group">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={story.coverImageUrl || "/placeholder-manga.jpg"}
            alt={story.title}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
          <div className="absolute top-2 right-2">
            <Badge>{story.genre}</Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-1">{story.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {story.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{story.likeCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{story.viewCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{story.chapterCount} Ch</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="text-xs text-muted-foreground">By {story.author?.username || "Anonymous"}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}

