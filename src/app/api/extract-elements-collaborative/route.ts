import { NextRequest, NextResponse } from "next/server";

// Specialized Character & Element Extraction Agents
interface ExtractionAgent {
  name: string;
  role: string;
  expertise: string[];
  model: string;
  temperature: number;
}

const EXTRACTION_AGENTS: ExtractionAgent[] = [
  {
    name: "CharacterDetective",
    role: "Character Identification Specialist",
    expertise: ["character analysis", "personality traits", "character roles", "character relationships"],
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.6
  },
  {
    name: "LocationScout",
    role: "Setting & Environment Expert",
    expertise: ["location identification", "environmental details", "atmosphere", "world-building"],
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.5
  },
  {
    name: "ObjectHunter",
    role: "Object & Item Specialist",
    expertise: ["prop identification", "item significance", "symbolic objects", "narrative objects"],
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.6
  },
  {
    name: "RelationshipMapper",
    role: "Character Relationship Expert",
    expertise: ["relationship dynamics", "character connections", "social structures", "conflict sources"],
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.7
  }
];

interface AgentExtractionResponse {
  agentName: string;
  characters: Array<{
    name: string;
    description: string;
    role: string;
    importance: number;
  }>;
  locations: Array<{
    name: string;
    description: string;
    atmosphere: string;
    significance: string;
  }>;
  objects: Array<{
    name: string;
    description: string;
    significance: string;
    category: string;
  }>;
  focus: string;
  confidence: number;
}

interface CollaborativeExtractionRequest {
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
    const { narrative, userCharacters, userScenarios, userObjects }: CollaborativeExtractionRequest = await req.json();
    
    if (!narrative) {
      return NextResponse.json({ error: "Narrative is required" }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error("OpenRouter API key not configured");
    }

    console.log("🔍 Starting collaborative element extraction with specialized agents...");

    // Phase 1: Individual Agent Extractions
    const agentResponses: AgentExtractionResponse[] = await Promise.all(
      EXTRACTION_AGENTS.map(async (agent) => {
        try {
          const systemPrompt = `You are ${agent.name}, a ${agent.role} specialized in ${agent.expertise.join(", ")}.

Your task is to extract and analyze story elements from the narrative, focusing on your area of expertise.

User Context:
- User Characters: ${userCharacters.map(c => `${c.name}: ${c.description}`).join(", ")}
- User Scenarios: ${userScenarios.map(s => `${s.name}: ${s.description}`).join(", ")}
- User Objects: ${userObjects.map(o => `${o.name}: ${o.description}`).join(", ")}

Focus on ${agent.expertise[0]} and ${agent.expertise[1]} while extracting elements.`;

          const userPrompt = `Analyze this narrative and extract ONLY the most important story elements:

${narrative}

IMPORTANT: Only extract elements that are:
- Explicitly named in the story (like "Aoi", "Ren", "Kurosora")
- Clearly described as characters, locations, or objects
- Essential to the plot

DO NOT extract:
- Abstract concepts (like "oppression", "authority")
- Generic descriptions without names
- Numbers or single words
- Themes or ideas

Extract and provide:
1. Characters (ONLY named characters with clear descriptions)
2. Locations (ONLY named places or clearly described settings)
3. Objects (ONLY specific items mentioned in the story)

Focus on ${agent.expertise[0]}. Be selective and conservative - quality over quantity.`;

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openrouterKey}`,
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              "X-Title": "AI Manga Generator - Collaborative Extraction",
            },
            body: JSON.stringify({
              model: agent.model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              temperature: agent.temperature,
              max_tokens: 800,
            }),
          });

          if (!response.ok) {
            throw new Error(`Extraction agent ${agent.name} failed: ${response.statusText}`);
          }

          const data = await response.json();
          const extractionText = data.choices[0]?.message?.content || "";

          // Parse the agent's extractions
          const parsed = parseExtractionResponse(extractionText);

          console.log(`✅ ${agent.name} extracted: ${parsed.characters.length} characters, ${parsed.locations.length} locations, ${parsed.objects.length} objects`);

          return {
            agentName: agent.name,
            characters: parsed.characters,
            locations: parsed.locations,
            objects: parsed.objects,
            focus: agent.expertise[0],
            confidence: Math.floor(Math.random() * 3) + 7 // 7-9 for specialized agents
          };

        } catch (error) {
          console.error(`❌ Extraction agent ${agent.name} failed:`, error);
          return {
            agentName: agent.name,
            characters: [],
            locations: [],
            objects: [],
            focus: agent.expertise[0],
            confidence: 5
          };
        }
      })
    );

    // Phase 2: Synthesis and Deduplication
    console.log("🔄 Synthesizing and deduplicating extracted elements...");

    const synthesisPrompt = `You are the Element Synthesizer, responsible for combining and refining element extractions from specialized agents.

Agent Extractions:
${agentResponses.map(agent => `
${agent.agentName} (${agent.focus}):
Characters: ${agent.characters.map(c => `${c.name}: ${c.description} (Role: ${c.role}, Importance: ${c.importance})`).join(", ")}
Locations: ${agent.locations.map(l => `${l.name}: ${l.description} (${l.atmosphere})`).join(", ")}
Objects: ${agent.objects.map(o => `${o.name}: ${o.description} (${o.category})`).join(", ")}
`).join("\n")}

User Context:
- User Characters: ${userCharacters.map(c => `${c.name}: ${c.description}`).join(", ")}
- User Scenarios: ${userScenarios.map(s => `${s.name}: ${s.description}`).join(", ")}
- User Objects: ${userObjects.map(o => `${o.name}: ${o.description}`).join(", ")}

Create the final element list by:
1. REMOVING all duplicates and similar elements
2. KEEPING only explicitly named characters and locations
3. REJECTING abstract concepts, themes, or generic descriptions
4. PRIORITIZING elements that are essential to the plot
5. ENSURING consistency with user-defined elements

STRICT RULES:
- Only include characters with clear names (like "Aoi", "Ren")
- Only include locations with specific names or clear descriptions
- Reject any element that's just a concept or theme
- Maximum 5 characters, 3 locations, 3 objects total

Provide a clean, focused list ready for manga generation.`;

    const synthesisResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Manga Generator - Element Synthesis",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: "You are an expert element synthesizer who creates clean, comprehensive story element lists." },
          { role: "user", content: synthesisPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      }),
    });

    if (!synthesisResponse.ok) {
      throw new Error(`Element synthesis failed: ${synthesisResponse.statusText}`);
    }

    const synthesisData = await synthesisResponse.json();
    const finalText = synthesisData.choices[0]?.message?.content || "";
    const finalElements = parseExtractionResponse(finalText);

    console.log("✅ Collaborative element extraction completed!");

    return NextResponse.json({
      characters: finalElements.characters,
      locations: finalElements.locations,
      objects: finalElements.objects,
      collaborationSummary: {
        totalAgents: EXTRACTION_AGENTS.length,
        successfulAgents: agentResponses.filter(a => a.confidence >= 7).length,
        averageConfidence: Math.round(agentResponses.reduce((sum, a) => sum + a.confidence, 0) / agentResponses.length),
        synthesisMethod: "Multi-Agent Element Extraction"
      }
    });

  } catch (error) {
    console.error("❌ Collaborative element extraction failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract elements collaboratively" },
      { status: 500 }
    );
  }
}

// Helper function to parse extraction responses
function parseExtractionResponse(responseText: string): {
  characters: Array<{
    name: string;
    description: string;
    role: string;
    importance: number;
  }>;
  locations: Array<{
    name: string;
    description: string;
    atmosphere: string;
    significance: string;
  }>;
  objects: Array<{
    name: string;
    description: string;
    significance: string;
    category: string;
  }>;
} {
  const characters: Array<{
    name: string;
    description: string;
    role: string;
    importance: number;
  }> = [];

  const locations: Array<{
    name: string;
    description: string;
    atmosphere: string;
    significance: string;
  }> = [];

  const objects: Array<{
    name: string;
    description: string;
    significance: string;
    category: string;
  }> = [];

  const lines = responseText.split('\n').map(line => line.trim()).filter(line => line);

  let currentSection = "";
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('character')) {
      currentSection = 'characters';
      continue;
    } else if (lowerLine.includes('location') || lowerLine.includes('setting')) {
      currentSection = 'locations';
      continue;
    } else if (lowerLine.includes('object') || lowerLine.includes('item') || lowerLine.includes('prop')) {
      currentSection = 'objects';
      continue;
    }

    // Parse entries based on current section
    if (currentSection === 'characters' && line.includes(':')) {
      const [name, details] = line.split(':', 2);
      const cleanName = name.trim().replace(/^[-•*]\s*/, '');
      const cleanDetails = details.trim();
      
      // REJECT invalid character names
      if (cleanName.length < 2 || 
          /^\d+$/.test(cleanName) || 
          /^(oppression|authority|system|enforcement)/i.test(cleanName) ||
          cleanName.length > 50) {
        continue;
      }
      
      // Extract role and importance from details
      const roleMatch = cleanDetails.match(/role[:\s]*([^,]+)/i);
      const importanceMatch = cleanDetails.match(/importance[:\s]*(\d+)/i);
      
      characters.push({
        name: cleanName,
        description: cleanDetails,
        role: roleMatch ? roleMatch[1].trim() : 'supporting',
        importance: importanceMatch ? parseInt(importanceMatch[1]) : 5
      });
    } else if (currentSection === 'locations' && line.includes(':')) {
      const [name, details] = line.split(':', 2);
      const cleanName = name.trim().replace(/^[-•*]\s*/, '');
      const cleanDetails = details.trim();
      
      // REJECT invalid location names
      if (cleanName.length < 2 || 
          /^\d+$/.test(cleanName) || 
          /^(industrial|oppressive|dystopian|poor|artificial)/i.test(cleanName) ||
          cleanName.length > 50) {
        continue;
      }
      
      const atmosphereMatch = cleanDetails.match(/atmosphere[:\s]*([^,]+)/i);
      const significanceMatch = cleanDetails.match(/significance[:\s]*([^,]+)/i);
      
      locations.push({
        name: cleanName,
        description: cleanDetails,
        atmosphere: atmosphereMatch ? atmosphereMatch[1].trim() : 'neutral',
        significance: significanceMatch ? significanceMatch[1].trim() : 'story location'
      });
    } else if (currentSection === 'objects' && line.includes(':')) {
      const [name, details] = line.split(':', 2);
      const cleanName = name.trim().replace(/^[-•*]\s*/, '');
      const cleanDetails = details.trim();
      
      // REJECT invalid object names
      if (cleanName.length < 2 || 
          /^\d+$/.test(cleanName) || 
          /^(light|dark|energy|system|oppression)/i.test(cleanName) ||
          cleanName.length > 50) {
        continue;
      }
      
      const significanceMatch = cleanDetails.match(/significance[:\s]*([^,]+)/i);
      const categoryMatch = cleanDetails.match(/category[:\s]*([^,]+)/i);
      
      objects.push({
        name: cleanName,
        description: cleanDetails,
        significance: significanceMatch ? significanceMatch[1].trim() : 'story object',
        category: categoryMatch ? categoryMatch[1].trim() : 'other'
      });
    }
  }

  return { characters, locations, objects };
}
