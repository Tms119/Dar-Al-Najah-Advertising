import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// forget old wrong-password counts (see convex/auth.ts)
crons.daily("clean sign-in locks", { hourUTC: 2, minuteUTC: 0 }, internal.auth.cleanSignInGuards, {});

export default crons;
