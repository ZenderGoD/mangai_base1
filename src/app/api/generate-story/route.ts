import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "dummy-key-for-build",
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, genre, length = "medium" } = await req.json();
    const model = "anthropic/claude-3.5-sonnet"; // Main orchestrator model for story generation

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const lengthGuide = {
      short: "a brief 3-4 paragraph story",
      medium: "a 6-8 paragraph story with good pacing",
      long: "a detailed 10-12 paragraph story with rich character development",
    };

    const systemPrompt = `You are an expert manga story orchestrator and creative writer. Generate engaging, appropriate stories in the ${genre} genre. 
    Focus on interesting characters, compelling plots, and vivid descriptions suitable for manga panels.
    Keep content appropriate and creative. Structure the story with clear scenes that could be visualized as manga panels.
    As the main orchestrator, ensure the story has proper pacing, dramatic tension, and visual storytelling elements.`;

    const userPrompt = `Write ${lengthGuide[length as keyof typeof lengthGuide] || lengthGuide.medium} based on: ${prompt}`;

    const { text } = await generateText({
      model: openrouter(model),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
    });

    return NextResponse.json({
      story: text,
      genre,
      prompt,
    });
  } catch (error) {
    console.error("Story generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate story";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

