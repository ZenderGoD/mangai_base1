import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { narrative, userCharacters } = await req.json();

    if (!narrative) {
      return NextResponse.json({ error: "Narrative is required" }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error("OpenRouter API key not configured");
    }

    const systemPrompt = `You are a character consistency specialist. Extract and establish definitive character references from the story narrative.

Your task:
1. Identify all characters mentioned in the story
2. Extract their physical appearance, clothing, and key traits
3. Create detailed character sheets for visual consistency
4. Note any environmental or location details that should remain consistent

Return a JSON object with this structure:
{
  "characters": [
    {
      "name": "Character Name",
      "description": "Detailed physical description including hair, eyes, clothing, accessories",
      "personality": "Key personality traits and mannerisms",
      "role": "Character's role in the story"
    }
  ],
  "locations": [
    {
      "name": "Location Name", 
      "description": "Detailed environmental description including lighting, time, weather, key objects"
    }
  ],
  "continuityNotes": "Important details to maintain across all panels"
}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Manga Generator - Character References",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract character and location references from this story:\n\n${narrative}\n\nUser-provided characters: ${userCharacters?.map((c: { name: string; description: string; }) => `${c.name}: ${c.description}`).join(", ") || "None"}` }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Character extraction failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);

    return NextResponse.json({
      characterReferences: result.characters || [],
      locationReferences: result.locations || [],
      continuityNotes: result.continuityNotes || ""
    });

  } catch (error) {
    console.error("Character reference extraction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to extract character references";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
