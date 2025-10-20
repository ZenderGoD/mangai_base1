import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, referenceImages, characterName, description } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    // Use GPT-4 Vision to check consistency
    const messages: Array<{
      role: string;
      content: Array<{ type: string; text?: string; image_url?: { url: string } }>;
    }> = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are an expert manga consistency checker. Analyze images and determine if they maintain character/scene consistency with reference images."
          }
        ]
      }
    ];

    // Build the user message with images
    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

    if (referenceImages && referenceImages.length > 0) {
      userContent.push({
        type: "text",
        text: `Reference images for ${characterName}: ${description}`
      });

      referenceImages.forEach((refUrl: string) => {
        userContent.push({
          type: "image_url",
          image_url: { url: refUrl }
        });
      });

      userContent.push({
        type: "text",
        text: "New generated image:"
      });
    }

    userContent.push({
      type: "image_url",
      image_url: { url: imageUrl }
    });

    userContent.push({
      type: "text",
      text: `Analyze this image. Does it match the character "${characterName}" with description: "${description}"? ${
        referenceImages && referenceImages.length > 0 
          ? "Compare with the reference images above. Check for consistency in appearance, style, and design." 
          : "Evaluate if the image matches the description."
      }

Respond with JSON:
{
  "isConsistent": true/false,
  "confidenceScore": 0-100,
  "issues": ["list of any inconsistencies"],
  "suggestions": ["improvements to make it more consistent"]
}`
    });

    messages.push({
      role: "user",
      content: userContent
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Manga Generator",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-nano",
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Consistency check failed: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("Vision API response:", JSON.stringify(data, null, 2));
      throw new Error("No response from vision AI");
    }

    // Extract JSON from response
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const result = JSON.parse(jsonContent);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Consistency check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to check consistency";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

