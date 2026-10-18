// src/lib/tracks/paths.ts
// Suggested learning paths shown on the home page: tracks in the order in
// which one prepares the next. Track ids come from catalog.ts; the name and
// goal are translation keys (home bundle) with an English fallback.

export interface LearningPath {
  id: string;
  tracks: string[];
  nameKey: string;
  nameFallback: string;
  goalKey: string;
  goalFallback: string;
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "graphics", tracks: ["math", "cpp", "opengl", "glsl", "vulkan"],
    nameKey: "pathGraphicsName", nameFallback: "Graphics programmer",
    goalKey: "pathGraphicsGoal", goalFallback: "From vector maths to your own engine on Vulkan.",
  },
  {
    id: "games2d", tracks: ["cpp", "sdl3", "gamedev"],
    nameKey: "pathGamesName", nameFallback: "2D games",
    goalKey: "pathGamesGoal", goalFallback: "From your first pointer to a game with a loop, physics and collisions.",
  },
  {
    id: "machine", tracks: ["cpp", "asm", "algorithms"],
    nameKey: "pathMachineName", nameFallback: "Under the hood",
    goalKey: "pathMachineGoal", goalFallback: "What the computer does with your code, one instruction at a time.",
  },
  {
    id: "science", tracks: ["math", "physics"],
    nameKey: "pathScienceName", nameFallback: "Science from scratch",
    goalKey: "pathScienceGoal", goalFallback: "The maths and physics that explain the world around you.",
  },
];
