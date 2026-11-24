import type { CategorySeed } from "./types";
import { stickers } from "./stickers";
import { wovenLabels } from "./wovenLabels";

/** Starter content for categories, by slug (see convex/catalogSeeds.ts). */
export const SEEDS: Record<string, CategorySeed> = {
  [wovenLabels.category.slug]: wovenLabels,
  [stickers.category.slug]: stickers,
};
