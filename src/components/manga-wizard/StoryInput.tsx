"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MentionInput } from "@/components/ui/mention-input";
import { MentionText } from "@/components/ui/mention-text";
import { Character, Scenario, Object } from "./types";

interface StoryInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  genre: string;
  setGenre: (genre: string) => void;
  style: string;
  setStyle: (style: string) => void;
  numberOfPanels: number;
  setNumberOfPanels: (panels: number) => void;
  userCharacters: Character[];
  userScenarios: Scenario[];
  userObjects: Object[];
}

const genres = [
  { value: "fantasy", label: "Fantasy" },
  { value: "action", label: "Action" },
  { value: "romance", label: "Romance" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "horror", label: "Horror" },
  { value: "comedy", label: "Comedy" },
];

const styles = [
  { value: "manga", label: "Manga (Japanese)" },
  { value: "manhwa", label: "Manhwa (Korean)" },
  { value: "webtoon", label: "Webtoon" },
];

export function StoryInput({
  prompt,
  setPrompt,
  genre,
  setGenre,
  style,
  setStyle,
  numberOfPanels,
  setNumberOfPanels,
  userCharacters,
  userScenarios,
  userObjects,
}: StoryInputProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Create Your Manga Story</h2>
        <p className="text-white/80">
          Describe your idea and watch AI bring it to life with characters, artwork, and panels
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-white font-medium">Story Idea</Label>
        <MentionInput
          value={prompt}
          onChange={setPrompt}
          placeholder="A young warrior discovers a mystical sword that holds the power to control elements... Use @ to mention your characters, scenarios, or objects!"
          className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/50"
          characters={userCharacters}
          scenarios={userScenarios}
          objects={userObjects}
        />
        
        {/* Mention Preview */}
        {prompt && (userCharacters.length > 0 || userScenarios.length > 0 || userObjects.length > 0) && (
          <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-white/60 mb-2">Preview with mentions:</p>
            <MentionText
              text={prompt}
              characters={userCharacters}
              scenarios={userScenarios}
              objects={userObjects}
              className="text-white/80 text-sm leading-relaxed"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="genre" className="text-white font-medium">Genre</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {genres.map((g) => (
                <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style" className="text-white font-medium">Art Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styles.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="panels" className="text-white font-medium">Panels</Label>
          <Input
            id="panels"
            type="number"
            min={4}
            max={12}
            value={numberOfPanels}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setNumberOfPanels(isNaN(val) ? 8 : val);
            }}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>
    </div>
  );
}
