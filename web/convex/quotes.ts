import { ConvexError, v } from "convex/values";
import { RateLimiter, HOUR, MINUTE } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
import { mutation } from "./_generated/server";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  // whole-site ceiling so a bot can't flood the inbox
  quoteGlobal: { kind: "token bucket", rate: 60, period: HOUR, capacity: 20 },
  // per-email ceiling
  quotePerEmail: { kind: "fixed window", rate: 3, period: 10 * MINUTE },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(s: string, max: number, field: string) {
  const t = s.trim();
  if (t.length > max) throw new ConvexError(`${field} is too long (max ${max} characters)`);
  return t;
}

/** Public: website quote / contact form. Validated and rate-limited. */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    company: v.string(),
    message: v.string(),
    interests: v.array(v.string()),
    productSlug: v.union(v.string(), v.null()),
    details: v.union(v.string(), v.null()),
    estimate: v.union(v.number(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, a) => {
    const name = clean(a.name, 100, "Name");
    const email = clean(a.email, 200, "Email").toLowerCase();
    if (!name) throw new ConvexError("Please enter your name");
    if (!EMAIL_RE.test(email)) throw new ConvexError("Please enter a valid email");
    if (a.interests.length > 10) throw new ConvexError("Too many categories selected");

    await rateLimiter.limit(ctx, "quoteGlobal", { throws: true });
    await rateLimiter.limit(ctx, "quotePerEmail", { key: email, throws: true });

    let productSlug: string | null = null;
    if (a.productSlug) {
      const p = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", a.productSlug!))
        .unique();
      productSlug = p ? p.slug : null;
    }

    await ctx.db.insert("quoteRequests", {
      name,
      email,
      phone: clean(a.phone, 40, "Phone"),
      company: clean(a.company, 120, "Company"),
      message: clean(a.message, 3000, "Message"),
      interests: a.interests.map((i) => clean(i, 40, "Interest")),
      productSlug,
      details: a.details === null ? null : clean(a.details, 1000, "Details"),
      estimate: a.estimate !== null && Number.isFinite(a.estimate) && a.estimate >= 0 ? a.estimate : null,
      status: "new",
    });
    return null;
  },
});
