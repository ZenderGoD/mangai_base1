"use client";

import { useEffect } from "react";
import { Card as GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMangaWizard } from "./hooks/useMangaWizard";
import { CharacterSection } from "./CharacterSection";
import { ScenarioSection } from "./ScenarioSection";
import { ObjectSection } from "./ObjectSection";
import { StoryInput } from "./StoryInput";
import { StepIndicator } from "./StepIndicator";
import { StoryReview } from "./StoryReview";
import { ProcessingView } from "./ProcessingView";
import { CompletionView } from "./CompletionView";
import { MangaGenerationWizardProps, StoryPlan, Character, Location, StoryData } from "./types";
import { useGenerationActivity } from "./hooks/useGenerationActivity";

export function MangaGenerationWizard({ storyId, chapterNumber, onSuccess }: MangaGenerationWizardProps) {
  const {
    // Main state
    step,
    setStep,
    prompt,
    setPrompt,
    genre,
    setGenre,
    style,
    setStyle,
    numberOfPanels,
    setNumberOfPanels,
    progress,
    setProgress,
    statusMessage,
    setStatusMessage,
    storyPlan,
    setStoryPlan,
    error,
    setError,

    // Editing state
    editSelection,
    setEditSelection,
    editInput,
    setEditInput,
    isRewriting,
    setIsRewriting,
    isEditDialogOpen,
    setIsEditDialogOpen,

    // Generated data
    storyData,
    setStoryData,
    characters,
    setCharacters,
    locations,
    setLocations,
    panelImages,
    setPanelImages,
    styleSeed,

    // Characters
    userCharacters,
    setUserCharacters,
    showCharacterInput,
    setShowCharacterInput,
    characterInput,
    setCharacterInput,
    characterImage,
    setCharacterImage,
    isGeneratingCharacter,
    setIsGeneratingCharacter,
    editingCharacter,
    setEditingCharacter,

    // Scenarios
    userScenarios,
    setUserScenarios,
    showScenarioInput,
    setShowScenarioInput,
    scenarioInput,
    setScenarioInput,
    scenarioImage,
    setScenarioImage,
    scenarioType,
    setScenarioType,

    // Objects
    userObjects,
    setUserObjects,
    showObjectInput,
    setShowObjectInput,
    objectInput,
    setObjectInput,
    objectImage,
    setObjectImage,
    objectCategory,
    setObjectCategory,

    // Angles
    generatingAngles,
    setGeneratingAngles,

    // Relationships
    newRelationship,
    setNewRelationship,

    // Convex
    createChapter,
    updateStory,
    createCharacter,
    viewer,
  } = useMangaWizard();

  const { activateStage, appendPreview, updatePercent, reset } = useGenerationActivity();

  useEffect(() => {
    reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 0: Plan the Story Structure
  const handlePlanStory = async () => {
    if (!prompt.trim()) {
      setError("Please enter a story idea");
      return;
    }

    activateStage("storyPlanning");
    setStep("planning-story");
    setError("");
    setProgress(5);
    setStatusMessage("🧠 AI is planning your story structure...");

    try {
      const response = await fetch("/api/plan-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          genre,
          userCharacters,
          userScenarios,
          userObjects
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to plan story");
      }

      setStoryPlan(data);
      updatePercent(10);
      setNumberOfPanels(data.estimatedPanelsPerChapter || 8);
      setProgress(10);
      console.log("📋 Story Plan:", data);
      
      // Update story title & synopsis immediately
      try {
        await updateStory({ storyId, title: data.title, description: data.synopsis });
      } catch (e) {
        console.warn("Story update failed (non-blocking):", e);
      }
      
      // Automatically proceed to generate the first chapter
      await handleGenerateStory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to plan story");
      setStep("input");
      setProgress(0);
    }
  };

  // Step 1: Generate Story Narrative
  const handleGenerateStory = async (plan?: StoryPlan | null) => {
    const currentPlan = plan || storyPlan;
    
    setStep("generating-story");
    setProgress(15);
    setStatusMessage("🤖 AI is crafting your story narrative...");

    try {
      // Generate the specific chapter based on the plan
      const chapterOutline = currentPlan?.chapterOutlines?.find(
        (ch) => ch.chapterNumber === chapterNumber
      );
      
      const chapterPrompt = chapterOutline
        ? `${currentPlan?.title} - Chapter ${chapterNumber}: ${chapterOutline.title}. ${chapterOutline.summary}`
        : prompt;

        // Call API to generate story using collaborative agents
        const response = await fetch("/api/generate-story-collaborative", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: chapterPrompt, 
            genre, 
            style,
            numberOfPanels,
            userCharacters,
            userScenarios,
            userObjects
          }),
        });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate story");
      }

      activateStage("agentCollaboration");
      setStoryData({
        narrative: data.story,
        panels: [],
      });
      
      setProgress(20);
      setStep("story-review");
      setStatusMessage("✅ Story generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate story");
      setStep("input");
      setProgress(0);
    }
  };

  const handleRewrite = async () => {
    if (!storyData) return;
    if (!editInput.trim()) return;
    setIsRewriting(true);
    try {
      const resp = await fetch("/api/rewrite-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: storyData.narrative,
          selection: editSelection,
          instructions: editInput,
          genre,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to rewrite");
      setStoryData({ ...storyData, narrative: data.story });
      setEditSelection("");
      setEditInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rewrite failed");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleRetryStory = async () => {
    await handleGenerateStory();
  };

  // Step 2: Extract Characters & Elements (Auto-triggered)
  const handleExtractElements = async () => {
    activateStage("characterGeneration");
    setStep("extracting-elements");
    setProgress(30);
    setStatusMessage("🔍 Extracting characters, locations, and story elements...");

    try {
        // Use focused extraction to get only essential story elements
        const response = await fetch("/api/extract-elements-focused", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            narrative: storyData?.narrative,
            userCharacters,
            userScenarios,
            userObjects
          }),
        });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to extract elements");
      }

      const extractedCharacters = data.characters || [];
      const extractedLocations = data.locations || [];
      
      // Merge user-defined characters with extracted characters
      const allCharacters = [...userCharacters, ...extractedCharacters];
      setCharacters(allCharacters);
      setLocations(extractedLocations);
      setProgress(40);
      
      console.log("✅ Elements extracted:", { 
        characters: extractedCharacters.length, 
        locations: extractedLocations.length 
      });
      
      // Auto-proceed to next step immediately with all characters (user + extracted)
      await handleGenerateReferences(allCharacters, extractedLocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract elements");
      setStep("story-review");
    }
  };

  // Step 3: Generate Reference Images
  const handleGenerateReferences = async (chars?: Character[], locs?: Location[]) => {
    const charactersToUse = chars || characters;
    const locationsToUse = locs || locations;
    
    setStep("generating-references");
    setProgress(50);
    setStatusMessage("🎨 Generating reference images for characters and locations...");

    try {
      // Generate character images with Seedream v4 (only for characters without existing images)
      const characterPromises = charactersToUse.map(async (char) => {
        // Skip generation if character already has an image (user-defined characters)
        if (char.imageUrl && char.seed) {
          return char;
        }
        
        const prompt = `${style} style character design: ${char.description}, full body, reference sheet, white background`;
      const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, aspectRatio: "3:4" }),
        });
        const data = await response.json();
        return { ...char, imageUrl: data.imageUrl, seed: data.seed }; // Store seed for consistency
      });

      // Generate location images with Seedream v4
      const locationPromises = locationsToUse.map(async (loc) => {
        const prompt = `${style} style background: ${loc.description}, detailed environment, manga panel background`;
      const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, aspectRatio: "16:9" }),
        });
        const data = await response.json();
        return { ...loc, imageUrl: data.imageUrl, seed: data.seed }; // Store seed for consistency
      });

      const updatedCharacters = await Promise.all(characterPromises);
      const updatedLocations = await Promise.all(locationPromises);

      setCharacters(updatedCharacters);
      setLocations(updatedLocations);
      setProgress(65);
      updatePercent(60);

      updatedCharacters
        .filter((c) => c.imageUrl)
        .forEach((c) => appendPreview("characterGeneration", c.imageUrl as string));

      updatedLocations
        .filter((loc) => loc.imageUrl)
        .forEach((loc) => appendPreview("sceneGeneration", loc.imageUrl as string));

      activateStage("sceneGeneration");
      
      console.log("✅ Reference images generated");

      // Persist characters to database (best-effort, skips errors)
      try {
        await Promise.all(
          updatedCharacters.map((c) =>
            createCharacter({
              storyId,
              name: c.name,
              role: c.role || "supporting",
              aliases: [],
              appearance: {},
              personality: {},
              behavior: {},
              backstory: c.description,
              occupation: undefined,
              skills: [],
              abilities: [],
              profileImageUrl: c.imageUrl,
              aiPrompt: c.description,
            }).catch((e) => console.warn("Create character failed:", e))
          )
        );
      } catch (e) {
        console.warn("Persist characters failed:", e);
      }
      
      // Auto-proceed to next step immediately
      await handleBreakIntoPanels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate reference images");
    }
  };

  // Step 4: Break Story into Panels
  const handleBreakIntoPanels = async () => {
    setStep("breaking-panels");
    setProgress(70);
    setStatusMessage("📖 Breaking story into manga panels...");

    try {
      const response = await fetch("/api/break-into-panels-collaborative", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            narrative: storyData?.narrative, 
            numberOfPanels,
            characters: characters.map(c => c.name),
            locations: locations.map(l => l.name),
            genre,
          }),
        });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to break into panels");
      }

      const updatedStoryData = storyData ? { ...storyData, panels: data.panels } : null;
      setStoryData(updatedStoryData);
      setProgress(75);
      updatePercent(80);
      
      console.log("✅ Panels created:", data.panels?.length);
      
      // Auto-proceed to final step immediately with panel data
      if (updatedStoryData) {
        await handleGeneratePanelImages(updatedStoryData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to break into panels");
    }
  };

  // Step 5: Generate Panel Images
  const handleGeneratePanelImages = async (storyDataParam?: StoryData | null) => {
    const storyDataToUse = storyDataParam || storyData;
    
    console.log("🎨 handleGeneratePanelImages called!");
    console.log("Story data:", storyDataToUse);
    console.log("Panels:", storyDataToUse?.panels);
    
    activateStage("panelSynthesis");
    setStep("generating-images");
    setProgress(80);
    setStatusMessage("🖼️ Generating manga panel artwork...");

    try {
      if (!storyDataToUse?.panels) {
        console.error("❌ No panels to generate!");
        throw new Error("No panels to generate");
      }
      
      console.log(`🖼️ Generating ${storyDataToUse.panels.length} panel images...`);
      console.log(`📋 Available characters for reference:`, {
        userCharacters: userCharacters.map(c => ({ name: c.name, hasImage: !!c.imageUrl, role: c.role })),
        extractedCharacters: characters.map(c => ({ name: c.name, hasImage: !!c.imageUrl })),
        userScenarios: userScenarios.map(s => ({ name: s.name, hasImage: !!s.imageUrl })),
        userObjects: userObjects.map(o => ({ name: o.name, hasImage: !!o.imageUrl }))
      });

      const panelPromises = storyDataToUse.panels.map(async (panel, panelIndex: number) => {
        // Combine all character sources (user-defined + extracted)
        const allCharacters = [...userCharacters, ...characters];
        
        // Enhanced character matching with better context awareness
        const relevantCharImages = allCharacters
          .filter(c => {
            if (!c.imageUrl) return false;
            
            // Direct name match
            const nameMatch = panel.description.toLowerCase().includes(c.name.toLowerCase());
            
            // Role-based matching (protagonist, hero, main character, etc.)
            const roleMatch = c.role === "protagonist" && (
              panel.description.toLowerCase().includes("hero") ||
              panel.description.toLowerCase().includes("main character") ||
              panel.description.toLowerCase().includes("protagonist") ||
              panel.description.toLowerCase().includes("he") ||
              panel.description.toLowerCase().includes("the character")
            );
            
            // Description keyword matching
            const descMatch = c.description && 
              panel.description.toLowerCase().includes(c.description.toLowerCase().split(' ').slice(0, 3).join(' '));
            
            return nameMatch || roleMatch || descMatch;
          })
          .flatMap(c => {
            // Include main character image
            const mainImage = c.imageUrl ? [c.imageUrl] : [];
            
            // Include all character angles
            const angleImages = c.angles?.map(angle => angle.imageUrl).filter(Boolean) || [];
            
            return [...mainImage, ...angleImages];
          });

        // Create enhanced image prompt that includes story context and character consistency
        const enhancedImagePrompt = `manga style: ${panel.description}. 
        Story context: ${storyDataToUse.narrative.substring(0, 200)}...
        Panel ${panelIndex + 1} of ${storyDataToUse.panels.length}. 
        Dialogue: ${panel.dialogue}
        Professional manga artwork, consistent character design, dramatic shading, clean linework.`;

        // Find relevant location references
        const relevantLocImages = locations
          .filter(l => panel.description.toLowerCase().includes(l.name.toLowerCase()))
          .map(l => l.imageUrl)
          .filter(Boolean);

        // Find relevant scenario references
        const relevantScenarioImages = userScenarios
          .filter(s => {
            if (!s.imageUrl) return false;
            return panel.description.toLowerCase().includes(s.name.toLowerCase()) ||
                   panel.description.toLowerCase().includes(s.description.toLowerCase().split(' ').slice(0, 3).join(' '));
          })
          .map(s => s.imageUrl)
          .filter(Boolean);

        // Find relevant object references
        const relevantObjectImages = userObjects
          .filter(o => {
            if (!o.imageUrl) return false;
            return panel.description.toLowerCase().includes(o.name.toLowerCase()) ||
                   panel.description.toLowerCase().includes(o.description.toLowerCase().split(' ').slice(0, 3).join(' '));
          })
          .map(o => o.imageUrl)
          .filter(Boolean);

        const refImages = [...relevantCharImages, ...relevantLocImages, ...relevantScenarioImages, ...relevantObjectImages];

        // Enhanced character matching for better seed selection
        const matchedChar = allCharacters.find(c => {
          const nameMatch = panel.description.toLowerCase().includes(c.name.toLowerCase());
          const roleMatch = c.role === "protagonist" && (
            panel.description.toLowerCase().includes("hero") ||
            panel.description.toLowerCase().includes("main character") ||
            panel.description.toLowerCase().includes("protagonist") ||
            panel.description.toLowerCase().includes("he") ||
            panel.description.toLowerCase().includes("the character")
          );
          const descMatch = c.description && panel.description.toLowerCase().includes(c.description.toLowerCase().split(' ').slice(0, 3).join(' '));
          return nameMatch || roleMatch || descMatch;
        });
        const matchedLoc = locations.find(l => panel.description.toLowerCase().includes(l.name.toLowerCase()));
        
        // Prioritize user-created characters for seed selection
        const userCreatedChar = userCharacters.find(c => c.imageUrl && c.seed && (
          panel.description.toLowerCase().includes(c.name.toLowerCase()) ||
          (c.role === "protagonist" && (
            panel.description.toLowerCase().includes("hero") ||
            panel.description.toLowerCase().includes("main character") ||
            panel.description.toLowerCase().includes("protagonist") ||
            panel.description.toLowerCase().includes("he") ||
            panel.description.toLowerCase().includes("the character")
          )) ||
          (c.description && panel.description.toLowerCase().includes(c.description.toLowerCase().split(' ').slice(0, 3).join(' ')))
        ));
        const panelSeed = userCreatedChar?.seed ?? matchedChar?.seed ?? matchedLoc?.seed ?? styleSeed;
        
        console.log(`Panel ${panelIndex + 1}: Found ${refImages.length} reference images (${relevantCharImages.length} chars, ${relevantLocImages.length} locs, ${relevantScenarioImages.length} scenarios, ${relevantObjectImages.length} objects), using seed: ${panelSeed} (user char: ${userCreatedChar?.name || 'none'})`);
        const styleBlock = `${style} style, black-and-white manga ink, clean linework, consistent character proportions, coherent shading, same visual style across panels`;

        let imageUrl: string | null = null;
        try {
          if (refImages.length > 0) {
            // Use image-to-image with references
            const response = await fetch("/api/edit-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                prompt: enhancedImagePrompt,
                imageUrls: refImages,
                aspectRatio: "1:1",
                seed: panelSeed,
              }),
            });
            const data = await response.json();
            if (data.error) {
              console.error(`Panel generation error:`, data.error);
            } else {
              imageUrl = data.imageUrl;
            }
          } else {
            // Use text-to-image
            const response = await fetch("/api/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                prompt: enhancedImagePrompt,
                aspectRatio: "1:1",
                seed: panelSeed,
              }),
            });
            const data = await response.json();
            if (data.error) {
              console.error(`Panel generation error:`, data.error);
            } else {
              imageUrl = data.imageUrl;
            }
          }

          // Auto consistency check and optionally refine once if needed
          if (imageUrl && (userCreatedChar || matchedChar || refImages.length > 0)) {
            try {
              const checkResp = await fetch("/api/check-consistency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  imageUrl,
                  referenceImages: refImages,
                  characterName: userCreatedChar?.name || matchedChar?.name || "",
                  description: userCreatedChar?.description || matchedChar?.description || "",
                  characterRole: userCreatedChar?.role || matchedChar?.role || "",
                }),
              });
              const checkData = await checkResp.json();
              if (checkResp.ok && (checkData.isConsistent === false || (typeof checkData.confidenceScore === "number" && checkData.confidenceScore < 75))) {
                const refineResp = await fetch("/api/refine-image", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    originalPrompt: `${styleBlock}. Manga panel: ${panel.description}`,
                    suggestions: Array.isArray(checkData.suggestions) ? checkData.suggestions : [],
                    seed: panelSeed,
                    aspectRatio: "1:1",
                  }),
                });
                const refineData = await refineResp.json();
                if (refineResp.ok && refineData.imageUrl) {
                  imageUrl = refineData.imageUrl;
                }
              }
            } catch (e) {
              console.warn("Consistency check/refine skipped due to error:", e);
            }
          }
        } catch (err) {
          console.error(`Panel generation failed:`, err);
        }

        setProgress(prev => Math.min(prev + (15 / storyDataToUse.panels.length), 95));
        return imageUrl;
      });

      const images = await Promise.all(panelPromises);
      
      // Filter out nulls and create panels only for successful images
      const successfulPanels = storyDataToUse.panels
        .map((panel, i: number) => ({
          imageUrl: images[i],
          text: panel.dialogue,
          order: i + 1,
        }))
        .filter(panel => panel.imageUrl !== null) as { imageUrl: string; text: string; order: number }[];
      successfulPanels.forEach((panel) => appendPreview("panelSynthesis", panel.imageUrl));
      
      if (successfulPanels.length === 0) {
        throw new Error("All image generation attempts failed. Please check your FAL_KEY_ID configuration.");
      }
      
      console.log(`✅ Successfully generated ${successfulPanels.length}/${images.length} panels`);
      
      setPanelImages(images.filter(Boolean) as string[]);
      setProgress(95);
      updatePercent(95);
      setStatusMessage("💾 Saving chapter to database...");
      
      // Save the chapter to Convex with only successful panels
      await createChapter({
        storyId,
        chapterNumber,
        title: `Chapter ${chapterNumber}`,
        content: storyDataToUse.narrative,
        panels: successfulPanels,
      });
      
      setProgress(100);
      activateStage("consistencyCheck");
      activateStage("completed");
      setStep("complete");
      setStatusMessage("🎉 Your manga chapter is complete!");
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate panel images");
    }
  };

  const handleContinue = () => {
    if (step === "story-review") {
      handleExtractElements();
    }
  };

  return (
    <GlassCard className="w-full">
      <div className="p-6 md:p-8 space-y-6">
        <StepIndicator step={step} />

        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <StoryInput
                prompt={prompt}
                setPrompt={setPrompt}
                genre={genre}
                setGenre={setGenre}
                style={style}
                setStyle={setStyle}
                numberOfPanels={numberOfPanels}
                setNumberOfPanels={setNumberOfPanels}
                userCharacters={userCharacters}
                userScenarios={userScenarios}
                userObjects={userObjects}
              />

              <CharacterSection
                userCharacters={userCharacters}
                setUserCharacters={setUserCharacters}
                showCharacterInput={showCharacterInput}
                setShowCharacterInput={setShowCharacterInput}
                characterInput={characterInput}
                setCharacterInput={setCharacterInput}
                characterImage={characterImage}
                setCharacterImage={setCharacterImage}
                isGeneratingCharacter={isGeneratingCharacter}
                setIsGeneratingCharacter={setIsGeneratingCharacter}
                editingCharacter={editingCharacter}
                setEditingCharacter={setEditingCharacter}
                generatingAngles={generatingAngles}
                setGeneratingAngles={setGeneratingAngles}
                newRelationship={newRelationship}
                setNewRelationship={setNewRelationship}
                style={style}
                viewer={viewer || null}
                onError={setError}
              />

              <ScenarioSection
                userScenarios={userScenarios}
                setUserScenarios={setUserScenarios}
                showScenarioInput={showScenarioInput}
                setShowScenarioInput={setShowScenarioInput}
                scenarioInput={scenarioInput}
                setScenarioInput={setScenarioInput}
                scenarioImage={scenarioImage}
                setScenarioImage={setScenarioImage}
                scenarioType={scenarioType}
                setScenarioType={setScenarioType}
                generatingAngles={generatingAngles}
                setGeneratingAngles={setGeneratingAngles}
                style={style}
                viewer={viewer || null}
                onError={setError}
              />

              <ObjectSection
                userObjects={userObjects}
                setUserObjects={setUserObjects}
                showObjectInput={showObjectInput}
                setShowObjectInput={setShowObjectInput}
                objectInput={objectInput}
                setObjectInput={setObjectInput}
                objectImage={objectImage}
                setObjectImage={setObjectImage}
                objectCategory={objectCategory}
                setObjectCategory={setObjectCategory}
                generatingAngles={generatingAngles}
                setGeneratingAngles={setGeneratingAngles}
                style={style}
                viewer={viewer || null}
                onError={setError}
              />

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <Button 
                onClick={handlePlanStory}
                className="w-full h-12"
                size="lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Story
              </Button>
            </motion.div>
          )}

          {/* Step 2: Story Review */}
          {step === "story-review" && storyData && (
            <motion.div
              key="story-review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <StoryReview
                storyData={storyData}
                editSelection={editSelection}
                setEditSelection={setEditSelection}
                editInput={editInput}
                setEditInput={setEditInput}
                isRewriting={isRewriting}
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                onContinue={handleContinue}
                onRetryStory={handleRetryStory}
                onRewrite={handleRewrite}
              />
            </motion.div>
          )}

          {/* Processing Steps */}
          {(step === "generating-story" || 
            step === "extracting-elements" || 
            step === "generating-references" || 
            step === "breaking-panels" || 
            step === "generating-images") && (
            <ProcessingView
              statusMessage={statusMessage}
              progress={progress}
            />
          )}

          {/* Complete */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center py-8"
            >
              <CompletionView
                panelImages={panelImages}
                storyId={storyId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
