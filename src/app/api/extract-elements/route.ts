import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { narrative } = await req.json();

    if (!narrative) {
      return NextResponse.json(
        { error: "Narrative is required" },
        { status: 400 }
      );
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const systemPrompt = `You are an expert at analyzing stories and extracting key elements for manga/comic creation.
Analyze the provided narrative and extract:
1. Main characters with detailed visual descriptions
2. Key locations/settings with detailed descriptions

Return a JSON object with this structure:
{
  "characters": [
    { "name": "Character Name", "description": "Detailed visual description including appearance, clothing, age, distinctive features" }
  ],
  "locations": [
    { "name": "Location Name", "description": "Detailed description of the environment, atmosphere, key visual elements" }
  ]
}`;

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
            content: `Extract characters and locations from this narrative:\n\n${narrative}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Element extraction failed: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenRouter response:", JSON.stringify(data, null, 2));
      throw new Error("No response from AI");
    }

    console.log("AI response content:", content);

    // Extract JSON from the response (might be wrapped in markdown)
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const extracted = JSON.parse(jsonContent);

    return NextResponse.json({
      characters: extracted.characters || [],
      locations: extracted.locations || [],
    });
  } catch (error) {
    console.error("Element extraction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to extract elements";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

