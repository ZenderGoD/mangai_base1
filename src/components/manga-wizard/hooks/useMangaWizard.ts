import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
  Step, 
  StoryPlan, 
  StoryData, 
  Character, 
  Location, 
  Scenario, 
  Object, 
  GeneratingAngles,
  CharacterRelationship
} from "../types";

export function useMangaWizard() {
  // Convex mutations
  const createChapter = useMutation(api.chapters.createChapter);
  const updateStory = useMutation(api.stories.updateStory);
  const createCharacter = useMutation(api.characters.create);
  
  // Current user
  const viewer = useQuery(api.users.getCurrentUser);

  // Main wizard state
  const [step, setStep] = useState<Step>("input");
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("fantasy");
  const [style, setStyle] = useState("manga");
  const [numberOfPanels, setNumberOfPanels] = useState(8);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [storyPlan, setStoryPlan] = useState<StoryPlan | null>(null);
  const [error, setError] = useState("");

  // Editing state
  const [editSelection, setEditSelection] = useState<string>("");
  const [editInput, setEditInput] = useState<string>("");
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  
  // Generated data
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [panelImages, setPanelImages] = useState<string[]>([]);
  const [styleSeed] = useState<number>(() => Math.floor(Math.random() * 1_000_000_000));
  
  // User-defined characters
  const [userCharacters, setUserCharacters] = useState<Character[]>([]);
  const [showCharacterInput, setShowCharacterInput] = useState(false);
  const [characterInput, setCharacterInput] = useState("");
  const [characterImage, setCharacterImage] = useState("");
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<number | null>(null);

  // User-defined scenarios
  const [userScenarios, setUserScenarios] = useState<Scenario[]>([]);
  const [showScenarioInput, setShowScenarioInput] = useState(false);
  const [scenarioInput, setScenarioInput] = useState("");
  const [scenarioImage, setScenarioImage] = useState("");
  const [scenarioType, setScenarioType] = useState<Scenario['type']>("other");

  // User-defined objects
  const [userObjects, setUserObjects] = useState<Object[]>([]);
  const [showObjectInput, setShowObjectInput] = useState(false);
  const [objectInput, setObjectInput] = useState("");
  const [objectImage, setObjectImage] = useState("");
  const [objectCategory, setObjectCategory] = useState<Object['category']>("other");

  // State for generating angles
  const [generatingAngles, setGeneratingAngles] = useState<GeneratingAngles>({
    characters: new Set(),
    scenarios: new Set(),
    objects: new Set(),
  });

  const [newRelationship, setNewRelationship] = useState<CharacterRelationship>({
    characterName: "",
    relationshipType: "",
    description: ""
  });

  return {
    // Convex
    createChapter,
    updateStory,
    createCharacter,
    viewer,

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
  };
}
