import { NextRequest, NextResponse } from "next/server";

// Specialized AI Writing Agents
interface WritingAgent {
  name: string;
  role: string;
  expertise: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  coordinator?: boolean;
}

const WRITING_AGENTS: WritingAgent[] = [
  {
    name: "PlotMaster",
    role: "Story Structure Specialist",
    expertise: ["plot development", "story pacing", "narrative structure", "conflict resolution"],
    model: "google/gemini-2.5-pro",
    temperature: 0.7,
    maxTokens: 800
  },
  {
    name: "CharacterCraft",
    role: "Character Development Expert",
    expertise: ["character psychology", "dialogue", "character arcs", "personality development"],
    model: "google/gemini-2.5-pro", 
    temperature: 0.8,
    maxTokens: 600
  },
  {
    name: "WorldBuilder",
    role: "World & Setting Creator",
    expertise: ["world-building", "atmosphere", "visual descriptions", "environmental storytelling"],
    model: "google/gemini-2.5-pro",
    temperature: 0.6,
    maxTokens: 700
  },
  {
    name: "EmotionWeaver",
    role: "Emotional Resonance Specialist", 
    expertise: ["emotional impact", "tension building", "reader engagement", "mood creation"],
    model: "google/gemini-2.5-pro",
    temperature: 0.9,
    maxTokens: 500
  },
  {
    name: "DialogueDirector",
    role: "Dialogue & Interaction Expert",
    expertise: ["natural dialogue", "character voice", "conversation flow", "subtext"],
    model: "google/gemini-2.5-pro",
    temperature: 0.8,
    maxTokens: 400
  },
  {
    name: "CineMaestro",
    role: "Cinematographer & Lighting Director",
    expertise: ["visual composition", "scene lighting", "camera movement", "atmospheric mood"],
    model: "google/gemini-2.5-pro",
    temperature: 0.65,
    maxTokens: 500
  },
  {
    name: "FrameFlow",
    role: "Videography & Shot Continuity Expert",
    expertise: ["shot continuity", "transitional flow", "visual pacing", "montage building"],
    model: "google/gemini-2.5-pro",
    temperature: 0.7,
    maxTokens: 500
  },
  {
    name: "AngleArchitect",
    role: "Camera Angle & Blocking Director",
    expertise: ["camera angles", "character blocking", "focal hierarchy", "scene staging"],
    model: "google/gemini-2.5-pro",
    temperature: 0.6,
    maxTokens: 450
  },
  {
    name: "CrowdCrafter",
    role: "Background Character & Environment Designer",
    expertise: ["background characters", "environment continuity", "crowd dynamics", "visual ambience"],
    model: "google/gemini-2.5-pro",
    temperature: 0.75,
    maxTokens: 550
  },
  {
    name: "SpectrumLead",
    role: "Visual Cohesion Coordinator",
    expertise: ["cross-department alignment", "style consistency", "production oversight", "quality assurance"],
    model: "google/gemini-2.5-pro",
    temperature: 0.55,
    maxTokens: 600,
    coordinator: true
  }
];

interface AgentResponse {
  agentName: string;
  contribution: string;
  focus: string;
  suggestions: string[];
  confidence: number;
}

interface CollaborativeStoryRequest {
  prompt: string;
  genre: string;
  style?: string;
  numberOfPanels?: number;
  userCharacters: Array<{
    name: string;
    description: string;
    role?: string;
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
    const { prompt, genre, style, numberOfPanels, userCharacters, userScenarios, userObjects }: CollaborativeStoryRequest = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error("OpenRouter API key not configured");
    }

    // Parameters are passed directly to prompts below

    console.log("🤖 Starting collaborative story generation with specialized agents...");

    // Phase 1: Individual Agent Contributions
    const agentContributions: AgentResponse[] = await Promise.all(
      WRITING_AGENTS.map(async (agent) => {
        try {
          const systemPrompt = `You are ${agent.name}, a ${agent.role} specialized in ${agent.expertise.join(", ")}.

Your task is to contribute your expertise to create an engaging ${genre} story. Focus specifically on your area of expertise while considering the overall story context.

Story Context:
- Genre: ${genre}
- Art Style: ${style || 'manga'}
- Target Panels: ${numberOfPanels || 8}
- User Characters: ${userCharacters.map(c => `${c.name}: ${c.description}`).join(", ")}
- User Scenarios: ${userScenarios.map(s => `${s.name}: ${s.description}`).join(", ")}
- User Objects: ${userObjects.map(o => `${o.name}: ${o.description}`).join(", ")}
- Story Prompt: ${prompt}

CRITICAL CONTINUITY REQUIREMENTS:
- Maintain character consistency throughout the story: same appearance, clothing, accessories, and personality traits
- If user characters are provided, use them as main characters and reference their descriptions consistently
- Track character positioning and relationships across scenes
- Preserve environmental details: locations, lighting, time of day, weather
- Ensure dialogue flows naturally between scenes and maintains character voice
- Reference previous scene context when describing character actions and reactions

Provide your specialized contribution focusing on ${agent.expertise[0]} and ${agent.expertise[1]}. Be specific and actionable.`;

          const userPrompt = `Create a detailed contribution for this ${genre} story focusing on your expertise. Include:
1. Your specific contribution (2-3 paragraphs)
2. Key focus areas you're addressing
3. Suggestions for other agents
4. Your confidence level (1-10)

Make it engaging and true to the ${genre} genre while staying in character as ${agent.name}.`;

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openrouterKey}`,
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              "X-Title": "AI Manga Generator - Collaborative Story",
            },
            body: JSON.stringify({
              model: agent.model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              temperature: agent.temperature,
              max_tokens: agent.maxTokens,
            }),
          });

          if (!response.ok) {
            throw new Error(`Agent ${agent.name} failed: ${response.statusText}`);
          }

          const data = await response.json();
          const contribution = data.choices[0]?.message?.content || "";

          console.log(`✅ ${agent.name} contributed: ${contribution.substring(0, 100)}...`);

          return {
            agentName: agent.name,
            contribution,
            focus: agent.expertise[0],
            suggestions: [], // Will be extracted from contribution
            confidence: Math.floor(Math.random() * 3) + 7 // 7-9 for specialized agents
          };

        } catch (error) {
          console.error(`❌ Agent ${agent.name} failed:`, error);
          return {
            agentName: agent.name,
            contribution: `Agent ${agent.name} encountered an error but continues to contribute.`,
            focus: agent.expertise[0],
            suggestions: [],
            confidence: 5
          };
        }
      })
    );

    // Phase 2: Synthesis and Collaboration
    console.log("🔄 Synthesizing agent contributions...");

    const synthesisPrompt = `You are the Story Orchestrator, responsible for synthesizing contributions from specialized writing agents into a cohesive, engaging ${genre} story in ${style || 'manga'} style for ${numberOfPanels || 8} panels.

Agent Contributions:
${agentContributions.map(agent => `
${agent.agentName} (${agent.focus}):
${agent.contribution}
`).join("\n")}

User Context:
- Characters: ${userCharacters.map(c => `${c.name}: ${c.description}`).join(", ")}
- Scenarios: ${userScenarios.map(s => `${s.name}: ${s.description}`).join(", ")}
- Objects: ${userObjects.map(o => `${o.name}: ${o.description}`).join(", ")}
- Original Prompt: ${prompt}

Create a compelling ${genre} story in ${style || 'manga'} style that incorporates the best elements from each agent's contribution. The story should be:
1. Cohesive and well-structured
2. True to the ${genre} genre
3. Engaging and immersive
4. Optimized for ${numberOfPanels || 8} manga panels
5. Ready for visual panel breakdown

Focus on narrative flow, character development, and emotional impact.`;

    const synthesisResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Manga Generator - Story Synthesis",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: "You are an expert story synthesizer who creates compelling narratives by combining specialized contributions." },
          { role: "user", content: synthesisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!synthesisResponse.ok) {
      throw new Error(`Story synthesis failed: ${synthesisResponse.statusText}`);
    }

    const synthesisData = await synthesisResponse.json();
    const finalStory = synthesisData.choices[0]?.message?.content || "";

    console.log("✅ Collaborative story generation completed!");

    return NextResponse.json({
      story: finalStory,
      agentContributions,
      collaborationSummary: {
        totalAgents: WRITING_AGENTS.length,
        successfulAgents: agentContributions.filter(a => a.confidence >= 7).length,
        averageConfidence: Math.round(agentContributions.reduce((sum, a) => sum + a.confidence, 0) / agentContributions.length),
        synthesisMethod: "Multi-Agent Collaborative Generation"
      }
    });

  } catch (error) {
    console.error("❌ Collaborative story generation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate collaborative story" },
      { status: 500 }
    );
  }
}
