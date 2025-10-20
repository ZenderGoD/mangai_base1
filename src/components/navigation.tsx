"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Library, User, Moon, Sun, LogOut, Sparkles, Wand2 } from "lucide-react";
import { useTheme } from "next-themes";
import { MangaLogo } from "@/components/ui/manga-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export function Navigation() {
  const { setTheme, theme } = useTheme();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Detect if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Helper functions for hover behavior
  const handleMouseEnter = () => {
    if (!isMobile) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      setIsDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      const timeout = setTimeout(() => {
        setIsDropdownOpen(false);
      }, 150); // Small delay to prevent accidental closes
      setHoverTimeout(timeout);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl">
            <MangaLogo className="h-7 sm:h-8 w-7 sm:w-8" size={32} />
            <span className="hidden sm:inline bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">AI Manga</span>
            <span className="sm:hidden bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">Manga</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <Link href="/explore" className="hidden md:block">
              <Button variant="ghost" className="gap-2">
                <Library className="h-4 w-4" />
                Explore
              </Button>
            </Link>
            <Link href="/explore" className="md:hidden">
              <Button variant="ghost" size="icon">
                <Library className="h-4 w-4" />
                <span className="sr-only">Explore</span>
              </Button>
            </Link>
            <Link href="/generate" className="hidden md:block">
              <Button variant="default" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generate
              </Button>
            </Link>
            <Link href="/generate" className="md:hidden">
              <Button variant="default" size="icon">
                <Sparkles className="h-4 w-4" />
                <span className="sr-only">AI Generate</span>
              </Button>
            </Link>
            <Link href="/edit-image" className="hidden md:block">
              <Button variant="ghost" className="gap-2">
                <Wand2 className="h-4 w-4" />
                Edit Image
              </Button>
            </Link>
            <Link href="/edit-image" className="md:hidden">
              <Button variant="ghost" size="icon">
                <Wand2 className="h-4 w-4" />
                <span className="sr-only">Edit Image</span>
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <DropdownMenu 
                open={isDropdownOpen} 
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => isMobile && setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/my-stories">My Stories</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/favorites">Favorites</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/sign-in">
                <Button variant="default" size="sm" className="hidden sm:flex">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button variant="default" size="icon" className="sm:hidden">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

