"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MentionableItem {
  id: string;
  name: string;
  type: "character" | "scenario" | "object";
  description: string;
  imageUrl?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  characters: Array<{ name: string; description: string; imageUrl?: string }>;
  scenarios: Array<{ name: string; description: string; imageUrl?: string }>;
  objects: Array<{ name: string; description: string; imageUrl?: string }>;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  className,
  characters,
  scenarios,
  objects,
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Combine all mentionable items
  const allItems: MentionableItem[] = [
    ...characters.map((char) => ({
      id: `char-${char.name}`,
      name: char.name,
      type: "character" as const,
      description: char.description,
      imageUrl: char.imageUrl,
    })),
    ...scenarios.map((scenario) => ({
      id: `scenario-${scenario.name}`,
      name: scenario.name,
      type: "scenario" as const,
      description: scenario.description,
      imageUrl: scenario.imageUrl,
    })),
    ...objects.map((obj) => ({
      id: `object-${obj.name}`,
      name: obj.name,
      type: "object" as const,
      description: obj.description,
      imageUrl: obj.imageUrl,
    })),
  ];

  // Filter items based on mention query
  const filteredItems = allItems.filter((item) =>
    item.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

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

  const insertMention = useCallback((item: MentionableItem) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Find the start of the current mention (the @ symbol)
    const textBeforeCursor = value.substring(0, start);
    const mentionStart = textBeforeCursor.lastIndexOf("@");
    
    if (mentionStart === -1) return;

    // Replace the mention query with the selected item
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(end);
    const newValue = beforeMention + `@${item.name} ` + afterMention;
    
    onChange(newValue);
    setShowDropdown(false);
    setMentionQuery("");
    setSelectedIndex(0);

    // Focus back on textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = beforeMention.length + item.name.length + 2; // +2 for @ and space
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          insertMention(filteredItems[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setMentionQuery("");
        setSelectedIndex(0);
        break;
    }
  }, [showDropdown, filteredItems, selectedIndex, insertMention]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch && allItems.length > 0) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      
      // Position dropdown near cursor
      const textarea = e.target;
      const rect = textarea.getBoundingClientRect();
      const scrollTop = textarea.scrollTop;
      const lineHeight = 20; // Approximate line height
      const lines = textBeforeCursor.split('\n').length;
      const top = rect.top + (lines * lineHeight) - scrollTop + 30;
      
      setDropdownPosition({ top, left: rect.left });
      setShowDropdown(true);
      setSelectedIndex(0);
    } else {
      setShowDropdown(false);
      setMentionQuery("");
    }
  }, [onChange, allItems.length]);

  const handleClick = useCallback((item: MentionableItem) => {
    insertMention(item);
  }, [insertMention]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("min-h-32", className)}
      />
      
      {showDropdown && filteredItems.length > 0 && (
        <Card
          className="absolute z-50 w-80 max-h-60 overflow-y-auto bg-black/90 border-white/20 backdrop-blur-sm"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          <div className="p-2 space-y-1">
            {filteredItems.map((item, index) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-2 text-left",
                  index === selectedIndex && "bg-white/10"
                )}
                onClick={() => handleClick(item)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                    {item.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getIcon(item.type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium truncate">
                        @{item.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getTypeColor(item.type))}
                      >
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/70 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
