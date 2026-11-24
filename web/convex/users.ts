import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getAdminStatus } from "./lib/admin";

export const createUser = internalMutation({
  args: {
    method: v.object({ name: v.union(v.literal("usernamePassword"), v.literal("usernamePasswordGuarded")), profile: v.object({}) }),
  },
  returns: v.id("users"),
  handler: async (ctx) => {
    return await ctx.db.insert("users", {});
  },
});

/** The signed-in user for the admin UI: null when signed out. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const { username, isAdmin } = await getAdminStatus(ctx, userId);
    return { username, isAdmin };
  },
});
