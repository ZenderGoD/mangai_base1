import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { narrative, numberOfPanels, characters, locations } = await req.json();

    if (!narrative || !numberOfPanels) {
      return NextResponse.json(
        { error: "Narrative and numberOfPanels are required" },
        { status: 400 }
      );
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const characterList = characters?.join(", ") || "various characters";
    const locationList = locations?.join(", ") || "various locations";

    const systemPrompt = `You are an expert manga panel director and storyteller.
Break the narrative into exactly ${numberOfPanels} manga panels.

For each panel, provide:
1. A detailed visual description of what should be drawn (including characters: ${characterList}, and locations: ${locationList})
2. The dialogue/text that appears in the panel

Return a JSON object with this structure:
{
  "panels": [
    {
      "description": "Detailed visual description of the panel scene, composition, character poses, background elements",
      "dialogue": "Character dialogue or narration text that appears in this panel"
    }
  ]
}

Make sure the panels flow naturally and tell a complete story arc.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AI Manga Generator",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Break this narrative into ${numberOfPanels} manga panels:\n\n${narrative}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Panel breaking failed: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenRouter response:", JSON.stringify(data, null, 2));
      throw new Error("No response from AI");
    }

    console.log("AI response content:", content);

    // Extract JSON from the response (Claude might wrap it in markdown)
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const result = JSON.parse(jsonContent);

    return NextResponse.json({
      panels: result.panels || [],
    });
  } catch (error) {
    console.error("Panel breaking error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to break into panels";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

