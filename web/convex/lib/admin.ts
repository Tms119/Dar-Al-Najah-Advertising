import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import { env, type QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

function allowlist() {
  return (env.ADMIN_USERNAMES ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminStatus(ctx: QueryCtx, userId: Id<"users">) {
  const username = await ctx.runQuery(components.authUsername.public.getUsername, { userId });
  const isAdmin = username !== null && allowlist().includes(username.toLowerCase());
  return { username, isAdmin };
}

/** Throws unless the caller is signed in AND on the admin allowlist. */
export async function requireAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Not signed in");
  const { isAdmin } = await getAdminStatus(ctx, userId);
  if (!isAdmin) throw new ConvexError("Not authorized");
  return userId;
}
