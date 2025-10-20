"use client";

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
import { ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { Object } from "./types";

interface ObjectSectionProps {
  userObjects: Object[];
  setUserObjects: (objects: Object[] | ((prev: Object[]) => Object[])) => void;
  showObjectInput: boolean;
  setShowObjectInput: (show: boolean) => void;
  objectInput: string;
  setObjectInput: (input: string) => void;
  objectImage: string;
  setObjectImage: (image: string) => void;
  objectCategory: Object['category'];
  setObjectCategory: (category: Object['category']) => void;
  generatingAngles: { objects: Set<number> };
  setGeneratingAngles: (angles: (prev: { characters: Set<number>; scenarios: Set<number>; objects: Set<number> }) => { characters: Set<number>; scenarios: Set<number>; objects: Set<number> }) => void;
  style: string;
  viewer: { _id: string } | null;
  onError: (error: string) => void;
}

export function ObjectSection({
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
  generatingAngles,
  setGeneratingAngles,
  style,
  viewer,
  onError,
}: ObjectSectionProps) {
  
  const handleAddObject = () => {
    if (!objectInput.trim()) {
      onError("Please enter an object description");
      return;
    }

    const newObject: Object = {
      name: objectInput.split(' ').slice(0, 2).join(' '),
      description: objectInput,
      imageUrl: objectImage,
      category: objectCategory,
    };

    setUserObjects((prev: Object[]) => [...prev, newObject]);
    setObjectInput("");
    setObjectImage("");
    setObjectCategory("other");
    setShowObjectInput(false);
  };

  const handleGenerateObjectAngles = async (index: number) => {
    const object = userObjects[index];
    if (!object) return;

    setGeneratingAngles(prev => ({
      ...prev,
      objects: new Set(prev.objects).add(index)
    }));

    try {
      const response = await fetch("/api/generate-angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "object",
          name: object.name,
          description: object.description,
          baseImageUrl: object.imageUrl,
          style,
          count: 4,
          userId: viewer?._id,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setUserObjects((prev: Object[]) => prev.map((obj, i) => 
        i === index 
          ? { ...obj, angles: data.angles }
          : obj
      ));

    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to generate object angles");
    } finally {
      setGeneratingAngles(prev => {
        const newSet = new Set(prev.objects);
        newSet.delete(index);
        return { ...prev, objects: newSet };
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white font-medium">Objects (Optional)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowObjectInput(!showObjectInput)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {showObjectInput ? "Hide" : "Add Object"}
        </Button>
      </div>

      {showObjectInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Describe your object (e.g., 'Magical sword with glowing runes')"
                value={objectInput}
                onChange={(e) => setObjectInput(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                type="button"
                onClick={handleAddObject}
                disabled={!objectInput.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                Add Object
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white text-sm">Object Category</Label>
                <Select value={objectCategory} onValueChange={(value) => setObjectCategory(value as Object['category'])}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weapon">Weapon</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="decoration">Decoration</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <ImageUpload
                  onImageSelect={setObjectImage}
                  currentImage={objectImage}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Display user-created objects */}
      {userObjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-sm">Your Objects:</p>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Will be used as references in panels
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userObjects.map((object, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/20 rounded-lg p-4 space-y-3"
              >
                <div className="flex gap-3">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                    {object.imageUrl && (
                      <Image
                        src={object.imageUrl}
                        alt={object.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">{object.name}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateObjectAngles(index)}
                          disabled={generatingAngles.objects.has(index)}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border-purple-500/30"
                        >
                          {generatingAngles.objects.has(index) ? (
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
                          onClick={() => setUserObjects((prev: Object[]) => prev.filter((_, i) => i !== index))}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-200"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm">{object.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
                        {object.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Object Angles Gallery */}
                {object.angles && object.angles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs">Object Angles</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {object.angles.map((angle) => (
                        <div key={angle.id} className="relative">
                          <div className="relative w-full h-20 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                            <Image
                              src={angle.imageUrl}
                              alt={angle.description}
                              fill
                              className="object-cover"
                              unoptimized
                            />
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
    </div>
  );
}
