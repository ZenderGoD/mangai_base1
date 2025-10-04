import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, genre } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    // Use Claude as the main orchestrator to plan the entire story structure
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Manga Generator",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content: `You are a master manga story architect. Given a story idea, plan out:
1. A compelling title
2. An engaging synopsis (2-3 sentences)
3. Total number of chapters needed (realistic for manga serialization)
4. Brief description of what happens in each chapter
5. Estimated panels per chapter (typically 6-10 for web manga)

Respond ONLY with valid JSON in this exact format:
{
  "title": "Story Title",
  "synopsis": "Brief compelling synopsis",
  "totalChapters": 5,
  "estimatedPanelsPerChapter": 8,
  "chapterOutlines": [
    {
      "chapterNumber": 1,
      "title": "Chapter Title",
      "summary": "What happens in this chapter",
      "estimatedPanels": 8
    }
  ]
}`
          },
          {
            role: "user",
            content: `Plan a ${genre} manga story based on this idea: ${prompt}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Story planning failed: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("OpenRouter response:", JSON.stringify(data, null, 2));
      throw new Error("No response from AI");
    }

    console.log("Story plan response:", content);

    // Extract JSON from potential markdown wrapping
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const storyPlan = JSON.parse(jsonContent);

    return NextResponse.json(storyPlan);
  } catch (error) {
    console.error("Story planning error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to plan story";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

