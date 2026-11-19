import { defineApp } from "convex/server";
import { v } from "convex/values";
import auth from "@convex-dev/auth/convex.config.js";
import authPassword from "@convex-dev/auth/components/password/convex.config.js";
import authUsername from "@convex-dev/auth/components/username/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp({
  env: {
    // Comma-separated usernames allowed into the admin dashboard,
    // e.g. `npx convex env set ADMIN_USERNAMES=owner,staff1`
    ADMIN_USERNAMES: v.optional(v.string()),
  },
});

app.use(auth);
app.use(authPassword);
app.use(authUsername);
app.use(rateLimiter);

export default app;
