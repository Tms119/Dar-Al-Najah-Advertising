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

export const { signInWithUsernamePassword, changePassword } = setupUsernamePassword(auth, {
  component: components.authPassword,
  usernameComponent: components.authUsername,
}).attachUserCallbacks({
  createUser: internal.users.createUser,
});
