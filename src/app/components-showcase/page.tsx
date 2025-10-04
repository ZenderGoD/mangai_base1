"use client";

import { Button } from "@/components/ui/button";
import Particles from "@/components/ui/particles";
import { Meteors } from "@/components/ui/meteors";
import { BorderBeam } from "@/components/ui/border-beam";
import Ripple from "@/components/ui/ripple";
import TextShimmer from "@/components/ui/text-shimmer";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import AnimatedList from "@/components/ui/animated-list";
import { Sparkles, Home } from "lucide-react";
import Link from "next/link";

export default function ComponentsShowcase() {
  const listItems = [
    "Particles - Interactive particle effects",
    "Meteors - Falling meteor animations",
    "Border Beam - Animated border effects",
    "Ripple - Ripple wave animations",
    "Text Shimmer - Shimmering text effects",
    "Dot Pattern - Background dot patterns",
    "Shimmer Button - Buttons with shimmer",
    "Glass Card - Glassmorphism cards",
    "Animated Gradient - Moving gradients",
    "Animated List - Scroll animations",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Magic UI Components Showcase
            </h1>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Back Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Particles Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Particles</h2>
          <div className="relative h-[400px] rounded-lg border bg-card overflow-hidden">
            <Particles
              className="absolute inset-0"
              quantity={150}
              ease={80}
              color="#9333ea"
              refresh={false}
            />
            <div className="relative z-10 flex items-center justify-center h-full">
              <p className="text-2xl font-semibold">Interactive Particle Background</p>
            </div>
          </div>
        </section>

        {/* Meteors Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Meteors</h2>
          <div className="relative h-[400px] rounded-lg border bg-card overflow-hidden">
            <Meteors number={40} />
            <div className="relative z-10 flex items-center justify-center h-full">
              <p className="text-2xl font-semibold">Falling Meteor Effect</p>
            </div>
          </div>
        </section>

        {/* Border Beam Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Border Beam</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative h-[200px] rounded-lg border bg-card flex items-center justify-center">
              <BorderBeam size={250} duration={12} delay={0} />
              <p className="font-semibold">Fast Beam</p>
            </div>
            <div className="relative h-[200px] rounded-lg border bg-card flex items-center justify-center">
              <BorderBeam size={250} duration={20} delay={5} colorFrom="#ec4899" colorTo="#8b5cf6" />
              <p className="font-semibold">Slow Beam</p>
            </div>
            <div className="relative h-[200px] rounded-lg border bg-card flex items-center justify-center">
              <BorderBeam size={250} duration={15} delay={10} colorFrom="#10b981" colorTo="#3b82f6" />
              <p className="font-semibold">Custom Colors</p>
            </div>
          </div>
        </section>

        {/* Ripple Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Ripple</h2>
          <div className="relative h-[400px] rounded-lg border bg-card flex items-center justify-center overflow-hidden">
            <Ripple mainCircleSize={150} numCircles={10} />
            <Sparkles className="h-16 w-16 text-primary relative z-10" />
          </div>
        </section>

        {/* Text Shimmer Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Text Shimmer</h2>
          <div className="space-y-6 p-8 rounded-lg border bg-card">
            <TextShimmer className="text-3xl font-bold" as="h3">
              This text has a beautiful shimmer effect
            </TextShimmer>
            <TextShimmer className="text-xl" shimmerWidth={150}>
              Customize the shimmer width and speed
            </TextShimmer>
            <TextShimmer className="text-lg">
              Perfect for headings and important text
            </TextShimmer>
          </div>
        </section>

        {/* Dot Pattern Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Dot Pattern</h2>
          <div className="relative h-[300px] rounded-lg border bg-card flex items-center justify-center overflow-hidden">
            <DotPattern className="opacity-30" />
            <p className="text-2xl font-semibold relative z-10">Background Dot Pattern</p>
          </div>
        </section>

        {/* Shimmer Button Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Shimmer Button</h2>
          <div className="flex gap-4 flex-wrap p-8 rounded-lg border bg-card">
            <ShimmerButton
              background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              shimmerColor="#ffffff"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Purple Shimmer
            </ShimmerButton>
            <ShimmerButton
              background="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              shimmerColor="#ffffff"
            >
              Pink Shimmer
            </ShimmerButton>
            <ShimmerButton
              background="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              shimmerColor="#ffffff"
            >
              Blue Shimmer
            </ShimmerButton>
          </div>
        </section>

        {/* Glass Card Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Glass Card</h2>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <AnimatedGradient className="absolute inset-0">
              <div />
            </AnimatedGradient>
            <div className="relative z-10 p-8 flex items-center justify-center h-full">
              <GlassCard className="max-w-md p-8" blur="xl" opacity={0.2}>
                <h3 className="text-2xl font-bold mb-4">Glassmorphism Card</h3>
                <p className="text-muted-foreground mb-4">
                  Beautiful frosted glass effect with customizable blur and opacity.
                </p>
                <Button className="w-full">Learn More</Button>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Animated List Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Animated List</h2>
          <div className="flex justify-center p-8 rounded-lg border bg-card">
            <AnimatedList
              items={listItems}
              onItemSelect={(item, index) => console.log(`Selected: ${item} at index ${index}`)}
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={true}
            />
          </div>
        </section>

        {/* Combined Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Combined Effects</h2>
          <div className="relative h-[500px] rounded-lg border overflow-hidden">
            <DotPattern className="opacity-20" />
            <Particles
              className="absolute inset-0"
              quantity={80}
              ease={70}
              color="#ec4899"
              refresh={false}
            />
            <Meteors number={20} />
            <div className="relative z-10 flex items-center justify-center h-full p-8">
              <GlassCard className="max-w-2xl p-12 text-center" blur="xl" opacity={0.15}>
                <div className="relative inline-block mb-6">
                  <Ripple mainCircleSize={100} numCircles={6} />
                  <Sparkles className="h-12 w-12 text-primary relative z-10" />
                </div>
                <TextShimmer className="text-3xl font-bold mb-6" as="h3">
                  All Effects Combined
                </TextShimmer>
                <p className="text-muted-foreground mb-8">
                  This card combines multiple Magic UI components for a stunning visual effect.
                </p>
                <div className="relative inline-block">
                  <ShimmerButton
                    background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    shimmerColor="#ffffff"
                    className="px-8 py-4"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started
                  </ShimmerButton>
                  <BorderBeam size={200} duration={12} delay={0} />
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
