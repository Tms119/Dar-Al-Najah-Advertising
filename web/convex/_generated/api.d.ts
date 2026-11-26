/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as catalog from "../catalog.js";
import type * as catalogSeeds from "../catalogSeeds.js";
import type * as crons from "../crons.js";
import type * as invoices from "../invoices.js";
import type * as lib_admin from "../lib/admin.js";
import type * as lib_copy from "../lib/copy.js";
import type * as lib_imageModel from "../lib/imageModel.js";
import type * as lib_seeds_extraProducts from "../lib/seeds/extraProducts.js";
import type * as lib_seeds_index from "../lib/seeds/index.js";
import type * as lib_seeds_photoPrompts from "../lib/seeds/photoPrompts.js";
import type * as lib_seeds_stickers from "../lib/seeds/stickers.js";
import type * as lib_seeds_types from "../lib/seeds/types.js";
import type * as lib_seeds_wovenLabels from "../lib/seeds/wovenLabels.js";
import type * as lib_validate from "../lib/validate.js";
import type * as maintenance from "../maintenance.js";
import type * as mockups from "../mockups.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as team from "../team.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  catalog: typeof catalog;
  catalogSeeds: typeof catalogSeeds;
  crons: typeof crons;
  invoices: typeof invoices;
  "lib/admin": typeof lib_admin;
  "lib/copy": typeof lib_copy;
  "lib/imageModel": typeof lib_imageModel;
  "lib/seeds/extraProducts": typeof lib_seeds_extraProducts;
  "lib/seeds/index": typeof lib_seeds_index;
  "lib/seeds/photoPrompts": typeof lib_seeds_photoPrompts;
  "lib/seeds/stickers": typeof lib_seeds_stickers;
  "lib/seeds/types": typeof lib_seeds_types;
  "lib/seeds/wovenLabels": typeof lib_seeds_wovenLabels;
  "lib/validate": typeof lib_validate;
  maintenance: typeof maintenance;
  mockups: typeof mockups;
  seed: typeof seed;
  seedData: typeof seedData;
  team: typeof team;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  auth: import("@convex-dev/auth/_generated/component.js").ComponentApi<"auth">;
  authPassword: import("@convex-dev/auth/components/password/_generated/component.js").ComponentApi<"authPassword">;
  authUsername: import("@convex-dev/auth/components/username/_generated/component.js").ComponentApi<"authUsername">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
