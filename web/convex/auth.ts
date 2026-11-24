import { v, type ObjectType, type PropertyValidators } from "convex/values";
import type { RegisteredMutation } from "convex/server";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { setupConvexAuth } from "@convex-dev/auth/server";
import { setupUsernamePassword } from "@convex-dev/auth/methods/username-password/server";

/* Internal admin login: username + password.

   There is NO public sign-up. `signUpWithUsernamePassword` is deliberately
   not exported, so the function does not exist on the deployment and nobody
   can create an account from the website or by calling Convex directly.
   Accounts are created only by an existing admin (Admin → Team, see
   convex/team.ts) or from the CLI: `npx convex run team:bootstrapAdmin`. */
const auth = setupConvexAuth({ component: components.auth });
export const { signOut, refreshSession, isAuthenticated } = auth;

// changePassword comes from the library; sign-in is our own (below) so it can lock accounts
export const { changePassword } = setupUsernamePassword(auth, {
  component: components.authPassword,
  usernameComponent: components.authUsername,
}).attachUserCallbacks({
  createUser: internal.users.createUser,
});

/* Sign-in with a lockout on wrong passwords, per account:
   3 wrong tries → locked 5 minutes, and every wrong try after that adds
   5 more minutes (10, 15, 20…). A correct password clears it; a day with
   no wrong tries starts the count again. Unknown usernames get the same
   message as a wrong password and aren't tracked. The library's own limit
   (5 tries, then 1 per minute) still applies underneath. */
const FREE_TRIES = 3;
const STEP_MS = 5 * 60_000;
const FORGET_AFTER_MS = 24 * 60 * 60_000;

// bindMethod is how sign-in methods are built; it's typed only in the
// library's internal types, so this declares the small part we use.
type GuardedCtx = MutationCtx & {
  convexAuth: { completeSignIn(a: { userId: string; profile: Record<string, never>; authenticatedBy: unknown }): Promise<unknown> };
};
type BindMethod = (o: { name: string; createUser: unknown }) => {
  authMutation: <A extends PropertyValidators, R>(fn: {
    args: A;
    handler: (ctx: GuardedCtx, args: ObjectType<A>) => Promise<R>;
  }) => RegisteredMutation<"public", ObjectType<A>, Promise<R>>;
};
const { authMutation } = (auth as unknown as { bindMethod: BindMethod }).bindMethod({
  name: "usernamePasswordGuarded",
  createUser: internal.users.createUser,
});

export const signInWithUsernamePassword = authMutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const userId = await ctx.runQuery(components.authUsername.public.getUserIdByUsername, { username });
    if (userId === null) return { status: "error" as const, userError: { error: "USER_NOT_FOUND" as const } };

    const now = Date.now();
    const guard = await ctx.db.query("signInGuards").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();
    if (guard && guard.lockedUntil > now) {
      return { status: "error" as const, userError: { error: "RATE_LIMITED" as const, retryAfterMs: guard.lockedUntil - now } };
    }

    const verify = await ctx.runMutation(components.authPassword.public.verifyPassword, { userId, password });
    if (!verify.success) {
      // the library's own limit: pass it on without counting. Every other
      // failure (wrong, too short, too long…) counts as a wrong password.
      if (verify.userError.error === "RATE_LIMITED") return { status: "error" as const, userError: verify.userError };
      const before = guard && now - guard.lastFailureAt < FORGET_AFTER_MS ? guard.failures : 0;
      const failures = before + 1;
      const lockMs = failures >= FREE_TRIES ? (failures - FREE_TRIES + 1) * STEP_MS : 0;
      const fields = { failures, lastFailureAt: now, lockedUntil: now + lockMs };
      if (guard) await ctx.db.patch(guard._id, fields);
      else await ctx.db.insert("signInGuards", { userId, ...fields });
      return lockMs
        ? { status: "error" as const, userError: { error: "RATE_LIMITED" as const, retryAfterMs: lockMs } }
        : { status: "error" as const, userError: verify.userError };
    }

    if (guard) await ctx.db.delete(guard._id);
    const tokens = await ctx.convexAuth.completeSignIn({ userId, profile: {}, authenticatedBy: components.authPassword });
    return { status: "complete" as const, tokens };
  },
});

/** Clears a sign-in lock, e.g. if the owner locked themselves out (CLI only):
    npx convex run --prod auth:unlockSignIn '{"username":"..."}' */
export const unlockSignIn = internalMutation({
  args: { username: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { username }) => {
    const userId = await ctx.runQuery(components.authUsername.public.getUserIdByUsername, { username: username.toLowerCase() });
    if (userId === null) return false;
    const guard = await ctx.db.query("signInGuards").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();
    if (guard) await ctx.db.delete(guard._id);
    return guard !== null;
  },
});
