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

Panel rules:
- Each panel should capture a single moment or action.
- Do not describe split panels or multiple simultaneous scenes within one panel.
- Keep characters, outfits, and locations consistent with previous panels.

CONTINUITY REQUIREMENTS:
- Maintain character appearance consistency: same hair, clothing, accessories across all panels
- Track location details: keep background elements, lighting, and setting consistent
- Preserve dialogue flow: conversations should connect logically between panels
- Reference previous panel context when describing character positioning and scene flow

For each panel, provide:
1. A detailed visual description of what should be drawn (including characters: ${characterList}, and locations: ${locationList})
2. The dialogue/text that appears in the panel
3. Character appearance notes (for consistency tracking)
4. Location/setting details (for environmental continuity)

Return a JSON object with this structure:
{
  "panels": [
    {
      "description": "Detailed visual description of the panel scene, composition, character poses, background elements",
      "dialogue": "Character dialogue or narration text that appears in this panel",
      "characterNotes": "Key appearance details to maintain in future panels",
      "locationDetails": "Environmental elements to keep consistent"
    }
  ]
}

Make sure the panels flow naturally and tell a complete story arc with perfect visual and narrative continuity.`;

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

    const panels = Array.isArray(result?.panels)
      ? result.panels
      : Array.isArray(result)
        ? result
        : Array.isArray(result?.data?.panels)
          ? result.data.panels
          : [];

    const normalized = panels.slice(0, numberOfPanels).map((panel: { description?: string; text?: string; dialogue?: string | string[]; }, index: number) => {
      const description = typeof panel?.description === "string" && panel.description.trim()
        ? panel.description.trim()
        : typeof panel?.text === "string" && panel.text.trim()
          ? panel.text.trim()
          : `Panel ${index + 1} scene`;

      let dialogue: string | string[] = "";
      if (typeof panel?.dialogue === "string") {
        dialogue = panel.dialogue.trim();
      } else if (Array.isArray(panel?.dialogue)) {
        dialogue = panel.dialogue
          .map((bubble: string | { text: string; character?: string; }) => {
            if (typeof bubble === "string") return bubble.trim();
            if (bubble && typeof bubble.text === "string") {
              return bubble.character ? `${bubble.character}: ${bubble.text.trim()}` : bubble.text.trim();
            }
            return "";
          })
          .filter(Boolean);
      }

      return {
        description,
        dialogue,
      };
    });

    return NextResponse.json({
      panels: normalized,
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

