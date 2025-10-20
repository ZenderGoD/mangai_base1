"use client";

import { useState, useEffect } from "react";
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
import { Users, Wand2, Loader2, ZoomIn } from "lucide-react";
import Image from "next/image";
import { Character } from "./types";

interface CharacterSectionProps {
  userCharacters: Character[];
  setUserCharacters: (characters: Character[] | ((prev: Character[]) => Character[])) => void;
  showCharacterInput: boolean;
  setShowCharacterInput: (show: boolean) => void;
  characterInput: string;
  setCharacterInput: (input: string) => void;
  characterImage: string;
  setCharacterImage: (image: string) => void;
  isGeneratingCharacter: boolean;
  setIsGeneratingCharacter: (generating: boolean) => void;
  editingCharacter: number | null;
  setEditingCharacter: (index: number | null) => void;
  generatingAngles: { characters: Set<number> };
  setGeneratingAngles: (angles: (prev: { characters: Set<number>; scenarios: Set<number>; objects: Set<number> }) => { characters: Set<number>; scenarios: Set<number>; objects: Set<number> }) => void;
  newRelationship: { characterName: string; relationshipType: string; description: string };
  setNewRelationship: (rel: { characterName: string; relationshipType: string; description: string } | ((prev: { characterName: string; relationshipType: string; description: string }) => { characterName: string; relationshipType: string; description: string })) => void;
  style: string;
  viewer: { _id: string } | null;
  onError: (error: string) => void;
}

const characterRoles = [
  { value: "protagonist", label: "Protagonist", description: "Main hero of the story" },
  { value: "antagonist", label: "Antagonist", description: "Main villain or opponent" },
  { value: "supporting", label: "Supporting", description: "Important secondary character" },
  { value: "minor", label: "Minor", description: "Small but recurring role" },
  { value: "cameo", label: "Cameo", description: "Brief appearance or mention" },
];

const relationshipTypes = [
  { value: "ally", label: "Ally" },
  { value: "enemy", label: "Enemy" },
  { value: "mentor", label: "Mentor" },
  { value: "student", label: "Student" },
  { value: "family", label: "Family" },
  { value: "friend", label: "Friend" },
  { value: "rival", label: "Rival" },
  { value: "romantic", label: "Romantic Interest" },
  { value: "colleague", label: "Colleague" },
  { value: "acquaintance", label: "Acquaintance" },
];

export function CharacterSection({
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
  generatingAngles,
  setGeneratingAngles,
  newRelationship,
  setNewRelationship,
  style,
  viewer,
  onError,
}: CharacterSectionProps) {
  // Image modal state
  const [modalImage, setModalImage] = useState<{
    url: string;
    title: string;
    description: string;
  } | null>(null);

  // Debug modal state
  useEffect(() => {
    console.log("Modal state:", modalImage);
  }, [modalImage]);
  
  const updateCharacterRole = (index: number, role: Character['role']) => {
    setUserCharacters((prev: Character[]) => prev.map((char, i) => 
      i === index ? { ...char, role } : char
    ));
  };

  const addCharacterRelationship = (index: number) => {
    if (!newRelationship.characterName.trim() || !newRelationship.relationshipType.trim()) return;
    
    setUserCharacters((prev: Character[]) => prev.map((char, i) => 
      i === index ? {
        ...char,
        relationships: [...(char.relationships || []), {
          characterName: newRelationship.characterName,
          relationshipType: newRelationship.relationshipType,
          description: newRelationship.description
        }]
      } : char
    ));
    
    setNewRelationship({ characterName: "", relationshipType: "", description: "" });
  };

  const removeCharacterRelationship = (charIndex: number, relIndex: number) => {
    setUserCharacters((prev: Character[]) => prev.map((char, i) => 
      i === charIndex ? {
        ...char,
        relationships: char.relationships?.filter((_, relI) => relI !== relIndex)
      } : char
    ));
  };

  const handleGenerateCharacter = async () => {
    if (!characterInput.trim()) {
      onError("Please enter a character description");
      return;
    }

    setIsGeneratingCharacter(true);
    onError("");

    try {
      const response = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          characterPrompt: characterInput,
          style,
          referenceImageUrl: characterImage,
          userId: viewer?._id,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newCharacter: Character = {
        name: characterInput.split(' ').slice(0, 2).join(' '),
        description: characterInput,
        imageUrl: data.imageUrl || characterImage, // Use generated image first, fallback to reference
        assetId: data.assetId,
        seed: data.seed,
        role: userCharacters.length === 0 ? "protagonist" : "supporting",
        relationships: [],
      };

      setUserCharacters((prev: Character[]) => [...prev, newCharacter]);
      setCharacterInput("");
      setCharacterImage("");
      setShowCharacterInput(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to generate character");
    } finally {
      setIsGeneratingCharacter(false);
    }
  };

  const handleGenerateCharacterAngles = async (index: number) => {
    const character = userCharacters[index];
    if (!character) return;

    setGeneratingAngles(prev => ({
      ...prev,
      characters: new Set(prev.characters).add(index)
    }));

    try {
      const response = await fetch("/api/generate-angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "character",
          name: character.name,
          description: character.description,
          baseImageUrl: character.imageUrl,
          style,
          count: 4,
          userId: viewer?._id,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setUserCharacters((prev: Character[]) => prev.map((char, i) => 
        i === index 
          ? { ...char, angles: data.angles }
          : char
      ));

    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to generate character angles");
    } finally {
      setGeneratingAngles(prev => {
        const newSet = new Set(prev.characters);
        newSet.delete(index);
        return { ...prev, characters: newSet };
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white font-medium">Characters (Optional)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCharacterInput(!showCharacterInput)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Users className="h-4 w-4 mr-2" />
          {showCharacterInput ? "Hide" : "Add Character"}
        </Button>
      </div>

      {showCharacterInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Describe your character (e.g., 'A tall wizard with silver hair and blue robes')"
                value={characterInput}
                onChange={(e) => setCharacterInput(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                type="button"
                onClick={handleGenerateCharacter}
                disabled={isGeneratingCharacter || !characterInput.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isGeneratingCharacter ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <ImageUpload
                onImageSelect={setCharacterImage}
                currentImage={characterImage}
                disabled={isGeneratingCharacter}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Display user-created characters */}
      {userCharacters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-sm">Your Characters:</p>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Will be used as references in panels
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userCharacters.map((char, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/20 rounded-lg p-4 space-y-3"
              >
                {/* Character Image and Basic Info */}
                <div className="flex gap-3">
                  <div 
                    className="relative w-16 h-20 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0 cursor-pointer hover:border-white/40 transition-colors group"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (char.imageUrl) {
                        setModalImage({
                          url: char.imageUrl,
                          title: char.name,
                          description: `Main character image for ${char.name}. ${char.description}`
                        });
                      }
                    }}
                  >
                    {char.imageUrl && (
                      <Image
                        src={char.imageUrl}
                        alt={char.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        unoptimized
                      />
                    )}
                    {char.imageUrl && (
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
                      <h4 className="text-white font-medium">{char.name}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCharacter(editingCharacter === index ? null : index)}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          {editingCharacter === index ? "Done" : "Edit"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateCharacterAngles(index)}
                          disabled={generatingAngles.characters.has(index)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-500/30"
                        >
                          {generatingAngles.characters.has(index) ? (
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
                          onClick={() => setUserCharacters((prev: Character[]) => prev.filter((_, i) => i !== index))}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-200"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <p className="text-white/60 text-xs line-clamp-2">{char.description}</p>
                  </div>
                </div>

                {/* Character Role */}
                <div className="space-y-2">
                  <Label className="text-white/70 text-xs">Role</Label>
                  <Select 
                    value={char.role || ""} 
                    onValueChange={(value) => updateCharacterRole(index, value as Character['role'])}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-8">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {characterRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Character Relationships */}
                {editingCharacter === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 border-t border-white/10 pt-3"
                  >
                    <Label className="text-white/70 text-xs">Relationships</Label>
                    
                    {/* Existing Relationships */}
                    {char.relationships && char.relationships.length > 0 && (
                      <div className="space-y-2">
                        {char.relationships.map((rel, relIndex) => (
                          <div key={relIndex} className="flex items-center justify-between bg-white/5 rounded p-2">
                            <div className="flex-1">
                              <div className="text-white text-xs font-medium">{rel.characterName}</div>
                              <div className="text-white/60 text-xs">{rel.relationshipType}</div>
                              {rel.description && (
                                <div className="text-white/50 text-xs">{rel.description}</div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCharacterRelationship(index, relIndex)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Relationship */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Character name"
                          value={newRelationship.characterName}
                          onChange={(e) => setNewRelationship((prev: { characterName: string; relationshipType: string; description: string }) => ({ ...prev, characterName: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-8 text-xs"
                        />
                        <Select 
                          value={newRelationship.relationshipType} 
                          onValueChange={(value) => setNewRelationship((prev: { characterName: string; relationshipType: string; description: string }) => ({ ...prev, relationshipType: value }))}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white h-8">
                            <SelectValue placeholder="Relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            {relationshipTypes.map((rel) => (
                              <SelectItem key={rel.value} value={rel.value}>
                                {rel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder="Description (optional)"
                        value={newRelationship.description}
                          onChange={(e) => setNewRelationship((prev: { characterName: string; relationshipType: string; description: string }) => ({ ...prev, description: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-8 text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => addCharacterRelationship(index)}
                        disabled={!newRelationship.characterName.trim() || !newRelationship.relationshipType.trim()}
                        className="w-full h-8 text-xs"
                      >
                        Add Relationship
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Character Angles Gallery */}
                {char.angles && char.angles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs">Character Angles</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {char.angles.map((angle) => (
                        <div key={angle.id} className="relative">
                          <div 
                            className="relative w-full h-20 rounded-lg overflow-hidden bg-white/10 border border-white/20 cursor-pointer hover:border-white/40 transition-colors group"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setModalImage({
                                url: angle.imageUrl,
                                title: `${char.name} - ${angle.description}`,
                                description: `Character angle for ${char.name}. ${angle.description}`
                              });
                            }}
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
