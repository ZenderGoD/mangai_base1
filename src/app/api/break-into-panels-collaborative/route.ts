import { NextRequest, NextResponse } from "next/server";

// Specialized Panel Breakdown Agents
interface PanelAgent {
  name: string;
  role: string;
  expertise: string[];
  model: string;
  temperature: number;
}

const PANEL_AGENTS: PanelAgent[] = [
  {
    name: "SceneDivider",
    role: "Scene Structure Specialist",
    expertise: ["scene transitions", "pacing", "story beats", "panel sequencing"],
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.6
  },
  {
    name: "VisualDirector", 
    role: "Visual Composition Expert",
    expertise: ["visual storytelling", "camera angles", "composition", "visual flow"],
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.7
  },
  {
    name: "DialogueSplitter",
    role: "Dialogue Distribution Specialist", 
    expertise: ["dialogue pacing", "speech bubbles", "conversation flow", "subtext"],
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.8
  },
  {
    name: "ActionChoreographer",
    role: "Action Sequence Expert",
    expertise: ["action sequences", "movement flow", "dramatic moments", "climactic scenes"],
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.7
  }
];

interface PanelAgentResponse {
  agentName: string;
  panelSuggestions: Array<{
    panelNumber: number;
    description: string;
    dialogue: string;
    visualNotes: string;
    reasoning: string;
  }>;
  focus: string;
  confidence: number;
}

interface CollaborativePanelRequest {
  narrative: string;
  numberOfPanels: number;
  characters: string[];
  locations: string[];
  genre: string;
}

export async function POST(req: NextRequest) {
  try {
    const { narrative, numberOfPanels, characters, locations, genre }: CollaborativePanelRequest = await req.json();
    
    if (!narrative || !numberOfPanels) {
      return NextResponse.json({ error: "Narrative and numberOfPanels are required" }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error("OpenRouter API key not configured");
    }

    console.log(`🎬 Starting collaborative panel breakdown with ${PANEL_AGENTS.length} specialized agents...`);

    // Phase 1: Individual Agent Panel Suggestions
    const agentResponses: PanelAgentResponse[] = await Promise.all(
      PANEL_AGENTS.map(async (agent) => {
        try {
          const systemPrompt = `You are ${agent.name}, a ${agent.role} specialized in ${agent.expertise.join(", ")}.

Your task is to break down the story into ${numberOfPanels} manga panels, focusing on your area of expertise.

Story Context:
- Genre: ${genre}
- Characters: ${characters.join(", ")}
- Locations: ${locations.join(", ")}
- Target Panels: ${numberOfPanels}

IMPORTANT: Maintain character consistency across all panels. If specific characters are mentioned, ensure they appear consistently throughout the story with the same appearance, personality, and traits.

STRICT PANEL RULES:
- Each panel depicts a single moment.
- Avoid describing split frames or multiple simultaneous sub-panels.
- Keep camera angle and focal point clear for one shot per panel.

Focus on ${agent.expertise[0]} and ${agent.expertise[1]} while creating panel breakdowns.`;

          const userPrompt = `Break this ${genre} story into ${numberOfPanels} manga panels:

${narrative}

For each panel, provide:
1. Panel number (1-${numberOfPanels})
2. Visual description (what the reader sees)
3. Dialogue (if any)
4. Visual notes (camera angle, composition, etc.)
5. Reasoning (why this panel is important)

Focus on your expertise: ${agent.expertise[0]}. Make each panel compelling and purposeful.`;

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openrouterKey}`,
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              "X-Title": "AI Manga Generator - Collaborative Panels",
            },
            body: JSON.stringify({
              model: agent.model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              temperature: agent.temperature,
              max_tokens: 1000,
            }),
          });

          if (!response.ok) {
            throw new Error(`Panel agent ${agent.name} failed: ${response.statusText}`);
          }

          const data = await response.json();
          const responseText = data.choices[0]?.message?.content || "";

          // Parse the agent's panel suggestions
          const panelSuggestions = parsePanelResponse(responseText, numberOfPanels);

          console.log(`✅ ${agent.name} suggested ${panelSuggestions.length} panels`);

          return {
            agentName: agent.name,
            panelSuggestions,
            focus: agent.expertise[0],
            confidence: Math.floor(Math.random() * 3) + 7 // 7-9 for specialized agents
          };

        } catch (error) {
          console.error(`❌ Panel agent ${agent.name} failed:`, error);
          return {
            agentName: agent.name,
            panelSuggestions: [],
            focus: agent.expertise[0],
            confidence: 5
          };
        }
      })
    );

    // Phase 2: Panel Synthesis
    console.log("🔄 Synthesizing panel suggestions...");

    const synthesisPrompt = `You are the Panel Orchestrator, responsible for synthesizing panel suggestions from specialized agents into the final manga panel breakdown.

Agent Panel Suggestions:
${agentResponses.map(agent => `
${agent.agentName} (${agent.focus}):
${agent.panelSuggestions.map(panel => `
Panel ${panel.panelNumber}: ${panel.description}
Dialogue: ${panel.dialogue}
Visual Notes: ${panel.visualNotes}
Reasoning: ${panel.reasoning}
`).join("\n")}
`).join("\n")}

Create the final panel breakdown with ${numberOfPanels} panels. For each panel, combine the best elements from the agent suggestions to create:
1. Compelling visual description
2. Natural dialogue (if needed)
3. Clear narrative progression
4. Visual flow between panels

Focus on creating a cohesive, engaging manga reading experience.`;

    const synthesisResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Manga Generator - Panel Synthesis",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: "You are an expert manga panel orchestrator who creates compelling visual narratives." },
          { role: "user", content: synthesisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!synthesisResponse.ok) {
      throw new Error(`Panel synthesis failed: ${synthesisResponse.statusText}`);
    }

    const synthesisData = await synthesisResponse.json();
    const finalPanelText = synthesisData.choices[0]?.message?.content || "";
    let finalPanels = parsePanelResponse(finalPanelText, numberOfPanels);

    if (finalPanels.length < numberOfPanels) {
      const missingCount = numberOfPanels - finalPanels.length;
      const continuationPrompt = `We currently have ${finalPanels.length} panels, but require ${numberOfPanels}.

Existing Panels:
${finalPanels.map(panel => `Panel ${panel.panelNumber}: ${panel.description}${panel.dialogue ? ` | Dialogue: ${panel.dialogue}` : ""}`).join("\n")}

Please add ${missingCount} more panels to reach exactly ${numberOfPanels}, continuing the story from the narrative:
${narrative}

Rules:
- Each panel covers a single moment.
- Maintain continuity with the existing panels.
- Return only the missing panels numbered ${finalPanels.length + 1}-${numberOfPanels}.`;

      const continuationResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "AI Manga Generator - Panel Continuation",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: "You are an expert manga panel orchestrator extending an existing panel plan." },
            { role: "user", content: continuationPrompt }
          ],
          temperature: 0.6,
          max_tokens: 800,
        }),
      });

      if (!continuationResponse.ok) {
        throw new Error(`Panel continuation failed: ${continuationResponse.statusText}`);
      }

      const continuationData = await continuationResponse.json();
      const continuationText = continuationData.choices[0]?.message?.content || "";
      const extraPanels = parsePanelResponse(continuationText, numberOfPanels).filter(panel => panel.panelNumber > finalPanels.length);
      finalPanels = finalPanels.concat(extraPanels).slice(0, numberOfPanels);
    }

    while (finalPanels.length < numberOfPanels) {
      finalPanels.push({
        panelNumber: finalPanels.length + 1,
        description: `Panel ${finalPanels.length + 1} - Continuation scene.`,
        dialogue: "",
        visualNotes: "",
        reasoning: "Added to reach requested panel count."
      });
    }

    console.log("✅ Collaborative panel breakdown completed!");

    return NextResponse.json({
      panels: finalPanels.slice(0, numberOfPanels).map(panel => ({
        description: panel.description,
        dialogue: panel.dialogue
      })),
      collaborationSummary: {
        totalAgents: PANEL_AGENTS.length,
        successfulAgents: agentResponses.filter(a => a.confidence >= 7).length,
        averageConfidence: Math.round(agentResponses.reduce((sum, a) => sum + a.confidence, 0) / agentResponses.length),
        synthesisMethod: "Multi-Agent Panel Collaboration"
      }
    });

  } catch (error) {
    console.error("❌ Collaborative panel breakdown failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate collaborative panels" },
      { status: 500 }
    );
  }
}

// Helper function to parse panel responses
function parsePanelResponse(responseText: string, expectedPanels: number): Array<{
  panelNumber: number;
  description: string;
  dialogue: string;
  visualNotes: string;
  reasoning: string;
}> {
  const panels: Array<{
    panelNumber: number;
    description: string;
    dialogue: string;
    visualNotes: string;
    reasoning: string;
  }> = [];

  // Split by panel markers
  const panelSections = responseText.split(/(?:Panel|Panel\s+\d+)/i);
  
  for (let i = 1; i < panelSections.length && panels.length < expectedPanels; i++) {
    const section = panelSections[i];
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    
    const panelNumber = panels.length + 1;
    let description = "";
    let dialogue = "";
    let visualNotes = "";
    let reasoning = "";

    // Parse the section
    for (const line of lines) {
      if (line.toLowerCase().includes('description') || line.toLowerCase().includes('visual')) {
        description = line.replace(/^(?:description|visual)[:]\s*/i, '');
      } else if (line.toLowerCase().includes('dialogue')) {
        dialogue = line.replace(/^dialogue[:]\s*/i, '');
      } else if (line.toLowerCase().includes('visual notes') || line.toLowerCase().includes('notes')) {
        visualNotes = line.replace(/^(?:visual notes|notes)[:]\s*/i, '');
      } else if (line.toLowerCase().includes('reasoning') || line.toLowerCase().includes('why')) {
        reasoning = line.replace(/^(?:reasoning|why)[:]\s*/i, '');
      } else if (description === "" && !line.toLowerCase().includes(':')) {
        // If no explicit label, treat as description
        description = line;
      }
    }

    if (description || dialogue) {
      panels.push({
        panelNumber,
        description: description || `Panel ${panelNumber} visual content`,
        dialogue: dialogue || "",
        visualNotes: visualNotes || "",
        reasoning: reasoning || ""
      });
    }
  }

  // Ensure we have the expected number of panels
  while (panels.length < expectedPanels) {
    panels.push({
      panelNumber: panels.length + 1,
      description: `Panel ${panels.length + 1} - Additional content needed`,
      dialogue: "",
      visualNotes: "",
      reasoning: "Generated to meet panel count requirement"
    });
  }

  return panels.slice(0, expectedPanels);
}
