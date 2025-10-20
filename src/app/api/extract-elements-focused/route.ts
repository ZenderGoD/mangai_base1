import { NextRequest, NextResponse } from "next/server";

interface FocusedExtractionRequest {
  narrative: string;
  userCharacters: Array<{
    name: string;
    description: string;
  }>;
  userScenarios: Array<{
    name: string;
    description: string;
  }>;
  userObjects: Array<{
    name: string;
    description: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const { narrative, userCharacters, userScenarios, userObjects }: FocusedExtractionRequest = await req.json();
    
    if (!narrative) {
      return NextResponse.json({ error: "Narrative is required" }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error("OpenRouter API key not configured");
    }

    console.log("🎯 Starting focused element extraction...");

    // Focus on user-defined elements first, then extract only essential story elements
    const extractionPrompt = `You are a focused story element extractor. Your job is to identify ONLY the most essential named characters, locations, and objects from this story.

STORY:
${narrative}

USER-DEFINED ELEMENTS (these are already known):
- Characters: ${userCharacters.map(c => `${c.name}: ${c.description}`).join(", ")}
- Scenarios: ${userScenarios.map(s => `${s.name}: ${s.description}`).join(", ")}
- Objects: ${userObjects.map(o => `${o.name}: ${o.description}`).join(", ")}

EXTRACTION RULES:
1. ONLY extract elements that are EXPLICITLY NAMED in the story
2. PRIORITIZE user-defined elements - they are already known
3. DO NOT extract abstract concepts, themes, or generic descriptions
4. MAXIMUM: 3 additional characters, 2 additional locations, 2 additional objects
5. REJECT any element that's just a number, single word, or concept

For your story "Eclipse Veins", you should focus on:
- Named characters like "Aoi", "Ren", "Noct"
- Named locations like "Kurosora", "Solar Core", "Core Chamber"
- Specific objects like "Eclipse Veins", "voidlight", "light cells"

Return ONLY a clean JSON response:
{
  "characters": [
    {
      "name": "Character Name",
      "description": "Brief description",
      "role": "protagonist/supporting/antagonist",
      "importance": 1-10
    }
  ],
  "locations": [
    {
      "name": "Location Name", 
      "description": "Brief description",
      "atmosphere": "mood/feeling",
      "significance": "why it matters"
    }
  ],
  "objects": [
    {
      "name": "Object Name",
      "description": "Brief description", 
      "significance": "why it matters",
      "category": "weapon/tool/other"
    }
  ]
}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Manga Generator - Focused Extraction",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: "You are a precise story element extractor. Return only valid JSON." },
          { role: "user", content: extractionPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`Focused extraction failed: ${response.statusText}`);
    }

    const data = await response.json();
    const extractionText = data.choices[0]?.message?.content || "";

    // Parse the JSON response
    let extractedElements;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedElements = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse extraction response:", parseError);
      // Fallback to empty extraction
      extractedElements = {
        characters: [],
        locations: [],
        objects: []
      };
    }

    // Validate and clean the extracted elements
    const validatedElements = {
      characters: (extractedElements.characters || [])
        .filter((char: { name: string; }) => 
          char.name && 
          char.name.length >= 2 && 
          char.name.length <= 50 &&
          !/^\d+$/.test(char.name) &&
          !/^(oppression|authority|system|enforcement|industrial|dystopian)/i.test(char.name)
        )
        .slice(0, 5), // Limit to 5 characters max
      
      locations: (extractedElements.locations || [])
        .filter((loc: { name: string; }) => 
          loc.name && 
          loc.name.length >= 2 && 
          loc.name.length <= 50 &&
          !/^\d+$/.test(loc.name) &&
          !/^(industrial|oppressive|dystopian|poor|artificial)/i.test(loc.name)
        )
        .slice(0, 3), // Limit to 3 locations max
      
      objects: (extractedElements.objects || [])
        .filter((obj: { name: string; }) => 
          obj.name && 
          obj.name.length >= 2 && 
          obj.name.length <= 50 &&
          !/^\d+$/.test(obj.name) &&
          !/^(light|dark|energy|system|oppression)/i.test(obj.name)
        )
        .slice(0, 3) // Limit to 3 objects max
    };

    console.log("✅ Focused extraction completed:", {
      characters: validatedElements.characters.length,
      locations: validatedElements.locations.length,
      objects: validatedElements.objects.length
    });

    return NextResponse.json({
      characters: validatedElements.characters,
      locations: validatedElements.locations,
      objects: validatedElements.objects,
      extractionMethod: "Focused Single-Agent Extraction"
    });

  } catch (error) {
    console.error("❌ Focused extraction failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract elements" },
      { status: 500 }
    );
  }
}
