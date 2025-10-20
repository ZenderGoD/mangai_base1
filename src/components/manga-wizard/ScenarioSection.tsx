"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { ImageModal } from "@/components/ui/image-modal";
import { BookOpen, Loader2, ZoomIn } from "lucide-react";
import Image from "next/image";
import { Scenario } from "./types";

interface ScenarioSectionProps {
  userScenarios: Scenario[];
  setUserScenarios: (scenarios: Scenario[] | ((prev: Scenario[]) => Scenario[])) => void;
  showScenarioInput: boolean;
  setShowScenarioInput: (show: boolean) => void;
  scenarioInput: string;
  setScenarioInput: (input: string) => void;
  scenarioImage: string;
  setScenarioImage: (image: string) => void;
  scenarioType: Scenario['type'];
  setScenarioType: (type: Scenario['type']) => void;
  generatingAngles: { scenarios: Set<number> };
  setGeneratingAngles: (angles: (prev: { characters: Set<number>; scenarios: Set<number>; objects: Set<number> }) => { characters: Set<number>; scenarios: Set<number>; objects: Set<number> }) => void;
  style: string;
  viewer: { _id: string } | null;
  onError: (error: string) => void;
}

export function ScenarioSection({
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
  generatingAngles,
  setGeneratingAngles,
  style,
  viewer,
  onError,
}: ScenarioSectionProps) {
  // Image modal state
  const [modalImage, setModalImage] = useState<{
    url: string;
    title: string;
    description: string;
  } | null>(null);
  
  const handleAddScenario = () => {
    if (!scenarioInput.trim()) {
      onError("Please enter a scenario description");
      return;
    }

    const newScenario: Scenario = {
      name: scenarioInput.split(' ').slice(0, 2).join(' '),
      description: scenarioInput,
      imageUrl: scenarioImage,
      type: scenarioType,
    };

    setUserScenarios((prev: Scenario[]) => [...prev, newScenario]);
    setScenarioInput("");
    setScenarioImage("");
    setScenarioType("other");
    setShowScenarioInput(false);
  };

  const handleGenerateScenarioAngles = async (index: number) => {
    const scenario = userScenarios[index];
    if (!scenario) return;

    setGeneratingAngles(prev => ({
      ...prev,
      scenarios: new Set(prev.scenarios).add(index)
    }));

    try {
      const response = await fetch("/api/generate-angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "scenario",
          name: scenario.name,
          description: scenario.description,
          baseImageUrl: scenario.imageUrl,
          style,
          count: 4,
          userId: viewer?._id,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setUserScenarios((prev: Scenario[]) => prev.map((scenario, i) => 
        i === index 
          ? { ...scenario, angles: data.angles }
          : scenario
      ));

    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to generate scenario angles");
    } finally {
      setGeneratingAngles(prev => {
        const newSet = new Set(prev.scenarios);
        newSet.delete(index);
        return { ...prev, scenarios: newSet };
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white font-medium">Scenarios (Optional)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowScenarioInput(!showScenarioInput)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          {showScenarioInput ? "Hide" : "Add Scenario"}
        </Button>
      </div>

      {showScenarioInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Describe your scenario (e.g., 'Epic battle on a floating island')"
                value={scenarioInput}
                onChange={(e) => setScenarioInput(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                type="button"
                onClick={handleAddScenario}
                disabled={!scenarioInput.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                Add Scenario
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white text-sm">Scenario Type</Label>
                <Select value={scenarioType} onValueChange={(value) => setScenarioType(value as Scenario['type'])}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="dialogue">Dialogue</SelectItem>
                    <SelectItem value="romance">Romance</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                    <SelectItem value="drama">Drama</SelectItem>
                    <SelectItem value="mystery">Mystery</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <ImageUpload
                  onImageSelect={setScenarioImage}
                  currentImage={scenarioImage}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Display user-created scenarios */}
      {userScenarios.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-sm">Your Scenarios:</p>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Will be used as references in panels
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userScenarios.map((scenario, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/20 rounded-lg p-4 space-y-3"
              >
                <div className="flex gap-3">
                  <div 
                    className="relative w-16 h-20 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0 cursor-pointer hover:border-white/40 transition-colors group"
                    onClick={() => scenario.imageUrl && setModalImage({
                      url: scenario.imageUrl,
                      title: scenario.name,
                      description: `Scenario image for ${scenario.name}. ${scenario.description}`
                    })}
                  >
                    {scenario.imageUrl && (
                      <Image
                        src={scenario.imageUrl}
                        alt={scenario.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        unoptimized
                      />
                    )}
                    {scenario.imageUrl && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                            <ZoomIn className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">{scenario.name}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateScenarioAngles(index)}
                          disabled={generatingAngles.scenarios.has(index)}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-200 border-green-500/30"
                        >
                          {generatingAngles.scenarios.has(index) ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            "More Angles"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setUserScenarios((prev: Scenario[]) => prev.filter((_, i) => i !== index))}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-200"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm">{scenario.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
                        {scenario.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scenario Angles Gallery */}
                {scenario.angles && scenario.angles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs">Scenario Angles</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {scenario.angles.map((angle) => (
                        <div key={angle.id} className="relative">
                          <div 
                            className="relative w-full h-20 rounded-lg overflow-hidden bg-white/10 border border-white/20 cursor-pointer hover:border-white/40 transition-colors group"
                            onClick={() => setModalImage({
                              url: angle.imageUrl,
                              title: `${scenario.name} - ${angle.description}`,
                              description: `Scenario angle for ${scenario.name}. ${angle.description}`
                            })}
                          >
                            <Image
                              src={angle.imageUrl}
                              alt={angle.description}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                                  <ZoomIn className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-white/60 mt-1 line-clamp-1">
                            {angle.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={!!modalImage}
        onClose={() => setModalImage(null)}
        imageUrl={modalImage?.url || ""}
        title={modalImage?.title}
        description={modalImage?.description}
      />
    </div>
  );
}
