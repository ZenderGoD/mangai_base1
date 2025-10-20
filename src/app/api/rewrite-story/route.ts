import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { story, selection, instructions, genre } = await req.json();

    if (!story || !instructions) {
      return NextResponse.json({ error: "story and instructions are required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const system = [
      "You are a senior manga story editor.",
      "Revise the given chapter to incorporate the user's edit request while keeping coherence, pacing, and continuity.",
      "Preserve the existing tone and genre unless the edit requests otherwise.",
      "Return ONLY the full revised chapter text, no preface or explanation.",
    ].join(" ");

    const user = [
      genre ? `Genre: ${genre}` : "",
      selection ? `Selected passage to adapt:\n"""${selection}"""` : "",
      `User edit request: ${instructions}`,
      "Original chapter:",
      story,
    ]
      .filter(Boolean)
      .join("\n\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Manga Generator",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Rewrite failed: ${errorText}`);
    }

    const data = await response.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("OpenRouter response:", JSON.stringify(data, null, 2));
      throw new Error("No response from AI");
    }

    return NextResponse.json({ story: content });
  } catch (error) {
    console.error("Rewrite story error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to rewrite story";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}




