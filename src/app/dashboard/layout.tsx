"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, BarChart3, Settings, ArrowLeft, Sparkles, Coins, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = useQuery(api.users.getCurrentUser);
  const pathname = usePathname();
  const router = useRouter();

  if (viewer === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!viewer) {
    router.push("/sign-in");
    return null;
  }

  const navItems = [
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
      description: "Your public creator profile"
    },
    {
      href: "/dashboard/comic-board",
      label: "Comic Board",
      icon: BarChart3,
      description: "Manage stories & analytics"
    },
    {
      href: "/dashboard/credits",
      label: "Credits",
      icon: Sparkles,
      description: "AI generation credits"
    },
    {
      href: "/dashboard/mangacoins",
      label: "MangaCoins",
      icon: Coins,
      description: "Read exclusive content"
    },
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: Receipt,
      description: "Purchase history"
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      description: "Account & preferences"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your stories, analytics, and profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1">
          <Card className="p-4 glass sticky top-20">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}

