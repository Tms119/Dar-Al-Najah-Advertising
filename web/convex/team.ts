import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation, internalQuery, mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/admin";

/* Staff accounts for the internal admin. There is no self sign-up:
   accounts are created here by an existing admin, or once from the CLI. */

const MIN_PASSWORD = 10;
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

async function createAccount(ctx: MutationCtx, rawUsername: string, password: string): Promise<Id<"users">> {
  const username = rawUsername.trim().toLowerCase();
  if (!USERNAME_RE.test(username))
    throw new ConvexError("Username must be 3–32 characters: lowercase letters, numbers, dots, dashes or underscores");
  if (password.length < MIN_PASSWORD) throw new ConvexError(`Password must be at least ${MIN_PASSWORD} characters`);
  if (password.length > 128) throw new ConvexError("Password is too long");
  if (password.trim() !== password) throw new ConvexError("Password can't start or end with a space");

  const taken = await ctx.runQuery(components.authUsername.public.getUserIdByUsername, { username });
  if (taken !== null) throw new ConvexError("That username is already taken");

  const userId = await ctx.db.insert("users", { isAdmin: true });
  const u = await ctx.runMutation(components.authUsername.public.setUsername, { userId, username });
  if (!u.success) throw new ConvexError(`Invalid username (${u.userError.error})`);
  const p = await ctx.runMutation(components.authPassword.public._internal_dangerous_setPassword, {
    userId,
    password,
    minimumLength: MIN_PASSWORD,
  });
  if (!p.success) {
    const msg = p.userError.error === "PASSWORD_TOO_COMMON" ? "That password is too common — choose a stronger one" : `Invalid password (${p.userError.error})`;
    throw new ConvexError(msg); // throwing rolls back the user + username above
  }
  return userId;
}

/** Admin → Team: list staff accounts. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const me = await requireAdmin(ctx);
    const users = await ctx.db.query("users").take(200);
    const out = [];
    for (const u of users) {
      const username = await ctx.runQuery(components.authUsername.public.getUsername, { userId: u._id });
      if (username) out.push({ _id: u._id, username, isAdmin: u.isAdmin === true, isMe: u._id === me, created: u._creationTime });
    }
    return out.sort((a, b) => a.created - b.created);
  },
});

/** Admin → Team: add a staff account. */
export const create = mutation({
  args: { username: v.string(), password: v.string() },
  returns: v.id("users"),
  handler: async (ctx, { username, password }) => {
    await requireAdmin(ctx);
    return await createAccount(ctx, username, password);
  },
});

/** Admin → Team: remove a staff account (revokes access immediately). */
export const remove = mutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, { userId }) => {
    const me = await requireAdmin(ctx);
    if (userId === me) throw new ConvexError("You can't remove your own account");
    await deleteAccount(ctx, userId);
    return null;
  },
});

async function deleteAccount(ctx: MutationCtx, userId: Id<"users">) {
  await ctx.runMutation(components.authUsername.public.deleteUsername, { userId });
  if (await ctx.db.get(userId)) await ctx.db.delete(userId);
}

/* ---------- CLI only (internal: not callable from the website) ---------- */

/** First account on a fresh deployment:
 *  npx convex run team:bootstrapAdmin '{"username":"owner","password":"…"}' --prod */
export const bootstrapAdmin = internalMutation({
  args: { username: v.string(), password: v.string() },
  returns: v.id("users"),
  handler: async (ctx, { username, password }) => createAccount(ctx, username, password),
});

/** Audit: every account that exists, for spotting anything unexpected. */
export const auditAccounts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(500);
    const out = [];
    for (const u of users) {
      out.push({
        userId: u._id,
        username: await ctx.runQuery(components.authUsername.public.getUsername, { userId: u._id }),
        isAdmin: u.isAdmin === true,
      });
    }
    return out;
  },
});

/** Remove an account by username from the CLI. */
export const removeByUsername = internalMutation({
  args: { username: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { username }) => {
    const id = await ctx.runQuery(components.authUsername.public.getUserIdByUsername, { username: username.toLowerCase() });
    if (!id) return false;
    await deleteAccount(ctx, id as Id<"users">);
    return true;
  },
});
