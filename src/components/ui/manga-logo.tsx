"use client";

import { cn } from "@/lib/utils";

interface MangaLogoProps {
  className?: string;
  size?: number;
}

export function MangaLogo({ className, size = 32 }: MangaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Outer circle with gradient */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="url(#mangaGradient)"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Book/Manga pages effect */}
      <path
        d="M 30 30 Q 50 25 70 30 L 70 75 Q 50 70 30 75 Z"
        fill="white"
        fillOpacity="0.9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      
      {/* Center binding */}
      <line
        x1="50"
        y1="27"
        x2="50"
        y2="75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Manga panel lines */}
      <line
        x1="35"
        y1="40"
        x2="45"
        y2="40"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="35"
        y1="50"
        x2="45"
        y2="50"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="35"
        y1="60"
        x2="45"
        y2="60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      <line
        x1="55"
        y1="40"
        x2="65"
        y2="40"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="55"
        y1="50"
        x2="65"
        y2="50"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="55"
        y1="60"
        x2="65"
        y2="60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* AI Sparkle */}
      <circle cx="75" cy="35" r="8" fill="url(#sparkleGradient)" />
      <path
        d="M 75 30 L 76 34 L 80 35 L 76 36 L 75 40 L 74 36 L 70 35 L 74 34 Z"
        fill="white"
      />
      
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="mangaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id="sparkleGradient">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function MangaLogoText({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 50"
      className={cn("h-8 w-auto", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="35"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="32"
        fontWeight="bold"
        fill="url(#textGradient)"
      >
        AI Manga
      </text>
    </svg>
  );
}

