"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Image as ImageIcon } from "lucide-react";

interface MentionableItem {
  name: string;
  type: "character" | "scenario" | "object";
}

interface MentionTextProps {
  text: string;
  characters: Array<{ name: string }>;
  scenarios: Array<{ name: string }>;
  objects: Array<{ name: string }>;
  className?: string;
}

export function MentionText({ 
  text, 
  characters, 
  scenarios, 
  objects, 
  className 
}: MentionTextProps) {
  // Combine all mentionable items
  const allItems: MentionableItem[] = [
    ...characters.map((char) => ({ name: char.name, type: "character" as const })),
    ...scenarios.map((scenario) => ({ name: scenario.name, type: "scenario" as const })),
    ...objects.map((obj) => ({ name: obj.name, type: "object" as const })),
  ];

  const getIcon = (type: MentionableItem["type"]) => {
    switch (type) {
      case "character":
        return <Users className="h-3 w-3" />;
      case "scenario":
        return <BookOpen className="h-3 w-3" />;
      case "object":
        return <ImageIcon className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: MentionableItem["type"]) => {
    switch (type) {
      case "character":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "scenario":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "object":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  const renderTextWithMentions = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Create regex pattern for all mentionable names
    const mentionPattern = new RegExp(
      `@(${allItems.map(item => item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    );

    let match;
    while ((match = mentionPattern.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Find the mentioned item
      const mentionedName = match[1];
      const mentionedItem = allItems.find(
        item => item.name.toLowerCase() === mentionedName.toLowerCase()
      );

      if (mentionedItem) {
        parts.push(
          <Badge
            key={match.index}
            variant="outline"
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs mx-1 ${getTypeColor(mentionedItem.type)}`}
          >
            {getIcon(mentionedItem.type)}
            @{mentionedItem.name}
          </Badge>
        );
      } else {
        // Fallback if item not found
        parts.push(`@${mentionedName}`);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className={className}>
      {renderTextWithMentions()}
    </div>
  );
}
