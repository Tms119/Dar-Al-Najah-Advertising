import { ConvexError, v } from "convex/values";
import { RateLimiter, DAY, HOUR } from "@convex-dev/rate-limiter";
import { action, env, internalMutation, mutation, query, type QueryCtx } from "./_generated/server";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/admin";
import { DEFAULT_MODEL, runModel, sniffType } from "./lib/imageModel";

/* Mockup Studio: AI product mockups (product + logo and/or text) on the
   standalone studio site (/studio). Access is by passes that admins issue;
   each pass allows a fixed number of generations (3 by default).
   Images come from Cloudflare Workers AI (FLUX.2); the token lives only in
   Convex env and is never sent to the browser. */

const MAX_INPUT_BYTES = 1_500_000; // the browser shrinks images to 512px first

export const GENERATIONS_PER_PASS = 3;
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I lookalikes
const CODE_LENGTH = 10; // 32^10 ≈ 10^15 combinations: not guessable

const SESSION_DAYS = 30;

const rateLimiter = new RateLimiter(components.rateLimiter, {
  // code checks: 8 tries per visitor IP, refilling one every ~2 minutes
  studioLoginPerIp: { kind: "token bucket", rate: 30, period: HOUR, capacity: 8 },
  // site-wide ceiling on code checks, so a botnet can't grind through codes
  studioLoginGlobal: { kind: "token bucket", rate: 600, period: HOUR, capacity: 100 },
  // a pass can use its 3 back to back, but failed (refunded) attempts can't loop
  mockupPerPass: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  // stays inside Cloudflare's free daily allowance for the default model
  mockupGlobal: { kind: "fixed window", rate: 80, period: DAY },
});

/** "abcd-efgh 23" → "ABCDEFGH23" */
const normalizeCode = (raw: string) => raw.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 32);
const formatCode = (code: string) => code.replace(/(.{4})(.{4})(.*)/, "$1-$2-$3");

function newCode() {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** Constant-time comparison, so a secret can't be guessed byte by byte. */
function sameSecret(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function newSessionToken() {
  const bytes = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The active pass behind a session key, or null. Expiry is enforced where a
    generation is spent (queries shouldn't read the clock). */
async function passBySession(ctx: QueryCtx, token: string) {
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  const tokenHash = await sha256(token);
  const session = await ctx.db.query("studioSessions").withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash)).unique();
  if (!session) return null;
  const pass = await ctx.db.get(session.passId);
  return pass?.isActive ? { pass, session } : null;
}

async function passByCode(ctx: QueryCtx, raw: string) {
  const code = normalizeCode(raw);
  if (code.length !== CODE_LENGTH) return null;
  return await ctx.db.query("studioPasses").withIndex("by_code", (q) => q.eq("code", code)).unique();
}

export const PLACEMENTS: Record<string, string> = {
  auto: "on the most natural print area of the product",
  front: "centred on the front of the product",
  chest: "small on the left chest area",
  back: "large on the back of the product",
  wrap: "large, wrapping around the product as an all over print",
};
export const STYLES: Record<string, string> = {
  studio: "Clean professional studio product photo on a soft light grey background with gentle shadows",
  lifestyle: "Lifestyle photo of the product in use in a modern bright setting with natural daylight",
  flatlay: "Top down flat lay photo of the product on a clean neutral surface with soft even light",
};
const ASPECTS: Record<string, [number, number]> = {
  square: [1024, 1024],
  portrait: [768, 1024],
  landscape: [1024, 768],
};

function clean(s: string, max: number) {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

function buildPrompt(a: {
  hasObject: boolean; objectText: string; hasLogo: boolean; text: string;
  placement: string; style: string; extra: string;
}) {
  // The logo goes first (image 1), then the product photo. In testing this
  // order, without asking to keep the product "exact", got past the model's
  // over eager safety filter far more often.
  let n = 0;
  const logoRef = a.hasLogo ? `the logo from image ${++n}` : "";
  const objectRef = a.hasObject ? `the product shown in image ${++n}` : `a ${a.objectText}`;
  const print = [logoRef, a.text ? `the text "${a.text}"` : ""].filter(Boolean).join(" together with ");
  return [
    `${STYLES[a.style]}.`,
    `Product mockup of ${objectRef}.`,
    `Print ${print} ${PLACEMENTS[a.placement]}, as a realistic high quality print that follows the surface shape, fabric folds and lighting.`,
    a.hasLogo ? "Reproduce the logo exactly: same shapes, colours and proportions, do not redraw or change it." : "",
    a.text ? `Spell the text exactly as "${a.text}" in a clean bold typeface.` : "",
    "Sharp focus, photorealistic, high detail, no watermark, no other text or logos.",
    a.extra ? `Additional direction: ${a.extra}` : "",
  ].filter(Boolean).join(" ");
}

/* ---------------- studio (public, pass required) ---------------- */

/** Exchanges an access code for a session key. Only callable by the website
    server (/api/studio/session), which adds the shared key and the visitor IP.
    Failed attempts return instead of throwing, so the attempt counters persist. */
export const startSession = mutation({
  args: { serverKey: v.string(), ip: v.string(), code: v.string() },
  returns: v.union(
    v.object({ ok: v.literal(true), token: v.string() }),
    v.object({ ok: v.literal(false), reason: v.union(v.literal("invalid"), v.literal("limited")), retryAfterMs: v.number() }),
  ),
  handler: async (ctx, { serverKey, ip, code }) => {
    const expected = env.STUDIO_SERVER_KEY;
    if (!expected || !sameSecret(serverKey, expected)) throw new ConvexError("Not allowed");

    const key = ip.trim().slice(0, 64) || "unknown";
    for (const name of ["studioLoginPerIp", "studioLoginGlobal"] as const) {
      const r = await rateLimiter.limit(ctx, name, name === "studioLoginPerIp" ? { key } : {});
      if (!r.ok) return { ok: false as const, reason: "limited" as const, retryAfterMs: r.retryAfter };
    }

    const pass = await passByCode(ctx, code);
    if (!pass?.isActive) return { ok: false as const, reason: "invalid" as const, retryAfterMs: 0 };

    const token = newSessionToken();
    await ctx.db.insert("studioSessions", {
      passId: pass._id,
      tokenHash: await sha256(token),
      expiresAt: Date.now() + SESSION_DAYS * 86_400_000,
    });
    // keep the table tidy: drop this pass's expired sessions
    const old = await ctx.db.query("studioSessions").withIndex("by_passId", (q) => q.eq("passId", pass._id)).take(50);
    await Promise.all(old.filter((x) => x.expiresAt < Date.now()).map((x) => ctx.db.delete(x._id)));
    return { ok: true as const, token };
  },
});

/** The signed-in pass for a session key, or null. */
export const session = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const found = await passBySession(ctx, token);
    if (!found) return null;
    const { pass } = found;
    return { label: pass.label, used: pass.used, limit: pass.limit, remaining: Math.max(0, pass.limit - pass.used) };
  },
});

export const endSession = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, { token }) => {
    const found = await passBySession(ctx, token);
    if (found) await ctx.db.delete(found.session._id);
    return null;
  },
});

/** The mockups made with this pass, newest first. */
export const passMockups = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const found = await passBySession(ctx, token);
    if (!found) return [];
    const { pass } = found;
    const rows = await ctx.db.query("mockups").withIndex("by_passId", (q) => q.eq("passId", pass._id)).order("desc").take(50);
    return await Promise.all(rows.map(async (m) => ({
      _id: m._id,
      _creationTime: m._creationTime,
      objectLabel: m.objectLabel,
      text: m.text,
      hadLogo: m.hadLogo,
      aspect: m.aspect,
      url: await ctx.storage.getUrl(m.storageId),
    })));
  },
});

/** Uses one generation from the pass (refunded if the image fails). */
export const reserve = internalMutation({
  args: { token: v.string() },
  returns: v.id("studioPasses"),
  handler: async (ctx, { token }) => {
    const found = await passBySession(ctx, token);
    if (!found || found.session.expiresAt < Date.now())
      throw new ConvexError("Your studio session has ended. Please enter your access code again.");
    const { pass } = found;
    if (pass.used >= pass.limit) throw new ConvexError("You've used all your generations. Message us on WhatsApp if you'd like more.");
    const burst = await rateLimiter.limit(ctx, "mockupPerPass", { key: pass._id });
    if (!burst.ok) throw new ConvexError(`Please wait ${Math.ceil(burst.retryAfter / 60000)} min before generating again.`);
    const all = await rateLimiter.limit(ctx, "mockupGlobal");
    if (!all.ok) throw new ConvexError("The studio is busy today. Please try again tomorrow.");
    await ctx.db.patch(pass._id, { used: pass.used + 1 });
    return pass._id;
  },
});

export const refund = internalMutation({
  args: { passId: v.id("studioPasses") },
  returns: v.null(),
  handler: async (ctx, { passId }) => {
    const pass = await ctx.db.get(passId);
    if (pass && pass.used > 0) await ctx.db.patch(passId, { used: pass.used - 1 });
    return null;
  },
});

export const record = internalMutation({
  args: {
    storageId: v.id("_storage"),
    objectLabel: v.string(),
    text: v.string(),
    placement: v.string(),
    style: v.string(),
    aspect: v.string(),
    extra: v.string(),
    hadObjectImage: v.boolean(),
    hadLogo: v.boolean(),
    model: v.string(),
    passId: v.id("studioPasses"),
  },
  returns: v.id("mockups"),
  handler: async (ctx, a) => await ctx.db.insert("mockups", a),
});

export const generate = action({
  args: {
    token: v.string(),
    objectImage: v.union(v.bytes(), v.null()),
    objectImageType: v.string(),
    objectText: v.string(),
    logoImage: v.union(v.bytes(), v.null()),
    logoImageType: v.string(),
    text: v.string(),
    placement: v.string(),
    style: v.string(),
    aspect: v.string(),
    extra: v.string(),
  },
  returns: v.object({ id: v.id("mockups"), url: v.union(v.string(), v.null()) }),
  handler: async (ctx, a): Promise<{ id: Id<"mockups">; url: string | null }> => {
    const objectText = clean(a.objectText, 80);
    const text = clean(a.text, 60).replace(/"/g, "'");
    const extra = clean(a.extra, 400);
    if (!a.objectImage && !objectText) throw new ConvexError("Add a product photo or type the product.");
    if (!a.logoImage && !text) throw new ConvexError("Add a logo, some text, or both.");
    if (!PLACEMENTS[a.placement] || !STYLES[a.style] || !ASPECTS[a.aspect]) throw new ConvexError("Invalid option.");
    for (const img of [a.objectImage, a.logoImage])
      if (img && img.byteLength > MAX_INPUT_BYTES) throw new ConvexError("Image is too large. Please use a smaller file.");
    const okType = (t: string) => (["image/png", "image/jpeg", "image/webp"].includes(t) ? t : "image/png");

    const passId: Id<"studioPasses"> = await ctx.runMutation(internal.mockups.reserve, { token: a.token });

    const model = env.CLOUDFLARE_IMAGE_MODEL || DEFAULT_MODEL;
    // same order as the prompt: logo first, then the product photo
    const images: Blob[] = [];
    if (a.logoImage) images.push(new Blob([a.logoImage], { type: okType(a.logoImageType) }));
    if (a.objectImage) images.push(new Blob([a.objectImage], { type: okType(a.objectImageType) }));
    const prompt = buildPrompt({ hasObject: !!a.objectImage, objectText, hasLogo: !!a.logoImage, text, placement: a.placement, style: a.style, extra });
    const [w, h] = ASPECTS[a.aspect];

    let bytes: Awaited<ReturnType<typeof runModel>>;
    try {
      bytes = await runModel(model, prompt, images, w, h);
    } catch (e) {
      await ctx.runMutation(internal.mockups.refund, { passId }); // failed attempts don't count
      throw e;
    }
    const storageId = await ctx.storage.store(new Blob([bytes], { type: sniffType(bytes) }));
    const id: Id<"mockups"> = await ctx.runMutation(internal.mockups.record, {
      storageId,
      objectLabel: objectText || "Product photo",
      text,
      placement: a.placement,
      style: a.style,
      aspect: a.aspect,
      extra,
      hadObjectImage: !!a.objectImage,
      hadLogo: !!a.logoImage,
      model,
      passId,
    });
    return { id, url: await ctx.storage.getUrl(storageId) };
  },
});

/* ---------------- admin: access passes and gallery ---------------- */

export const listPasses = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const passes = await ctx.db.query("studioPasses").order("desc").take(200);
    return passes.map((p) => ({ ...p, code: formatCode(p.code) }));
  },
});

export const createPass = mutation({
  args: { label: v.string() },
  returns: v.object({ id: v.id("studioPasses"), code: v.string() }),
  handler: async (ctx, { label }) => {
    const userId = await requireAdmin(ctx);
    const name = label.trim().slice(0, 80);
    if (!name) throw new ConvexError("Add who the pass is for");
    let code = newCode();
    while (await passByCode(ctx, code)) code = newCode();
    const id = await ctx.db.insert("studioPasses", { label: name, code, used: 0, limit: GENERATIONS_PER_PASS, isActive: true, createdBy: userId });
    return { id, code: formatCode(code) };
  },
});

export const setPassActive = mutation({
  args: { id: v.id("studioPasses"), isActive: v.boolean() },
  returns: v.null(),
  handler: async (ctx, { id, isActive }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { isActive });
    if (!isActive) {
      // switching a pass off signs out every device using it
      const sessions = await ctx.db.query("studioSessions").withIndex("by_passId", (q) => q.eq("passId", id)).take(200);
      await Promise.all(sessions.map((x) => ctx.db.delete(x._id)));
    }
    return null;
  },
});

/** Gives the pass a fresh set of generations. */
export const resetPass = mutation({
  args: { id: v.id("studioPasses") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { used: 0 });
    return null;
  },
});

/** Deletes the pass, its sessions and the mockups made with it. */
export const deletePass = mutation({
  args: { id: v.id("studioPasses") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const [made, sessions] = await Promise.all([
      ctx.db.query("mockups").withIndex("by_passId", (q) => q.eq("passId", id)).take(200),
      ctx.db.query("studioSessions").withIndex("by_passId", (q) => q.eq("passId", id)).take(200),
    ]);
    await Promise.all([
      ...made.flatMap((m) => [ctx.storage.delete(m.storageId), ctx.db.delete(m._id)]),
      ...sessions.map((x) => ctx.db.delete(x._id)),
    ]);
    await ctx.db.delete(id);
    return null;
  },
});

/** Everything generated in the studio, for the admin gallery. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("mockups").order("desc").take(60);
    const labels = new Map<Id<"studioPasses">, Promise<string>>();
    const labelOf = (id: Id<"studioPasses">) => {
      if (!labels.has(id)) labels.set(id, ctx.db.get(id).then((p) => p?.label ?? "Deleted pass"));
      return labels.get(id)!;
    };
    return await Promise.all(rows.map(async (m) => ({
      _id: m._id,
      _creationTime: m._creationTime,
      objectLabel: m.objectLabel,
      text: m.text,
      hadLogo: m.hadLogo,
      aspect: m.aspect,
      passLabel: await labelOf(m.passId),
      url: await ctx.storage.getUrl(m.storageId),
    })));
  },
});

export const remove = mutation({
  args: { id: v.id("mockups") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const m = await ctx.db.get(id);
    if (!m) return null;
    await ctx.storage.delete(m.storageId);
    await ctx.db.delete(id);
    return null;
  },
});

/** Whether the image service keys are set (so the admin can explain setup). */
export const status = query({
  args: {},
  returns: v.object({ connected: v.boolean() }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return { connected: !!(env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN) };
  },
});
