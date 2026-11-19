import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import { env, type QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/** Usernames in the ADMIN_USERNAMES env var are always admins (bootstrap / owner). */
function envAllowlist() {
  return (env.ADMIN_USERNAMES ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Admin = the account still exists AND (it was created as staff OR is on the env allowlist).
    Deleting the account revokes access immediately, even for live sessions. */
export async function getAdminStatus(ctx: QueryCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) return { username: null, isAdmin: false };
  const username = await ctx.runQuery(components.authUsername.public.getUsername, { userId });
  const isAdmin =
    username !== null && (user.isAdmin === true || envAllowlist().includes(username.toLowerCase()));
  return { username, isAdmin };
}

/** Throws unless the caller is signed in AND an admin. */
export async function requireAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Not signed in");
  const { isAdmin } = await getAdminStatus(ctx, userId);
  if (!isAdmin) throw new ConvexError("Not authorized");
  return userId;
}
