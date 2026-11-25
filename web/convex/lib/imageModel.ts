import { ConvexError } from "convex/values";
import { env } from "../_generated/server";

/* Cloudflare Workers AI image generation (FLUX.2), shared by the Mockup
   Studio and catalogue image generation. Call from actions only. */

export const DEFAULT_MODEL = "@cf/black-forest-labs/flux-2-klein-4b";

export function sniffType(bytes: Uint8Array) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return "image/png";
}

function fromBase64(b64: string) {
  const bin = atob(b64.replace(/^data:[^,]+,/, ""));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

class Flagged extends Error {}

/** The model's safety filter sometimes flags harmless mockups at random.
    Each attempt comes out different, so retry a couple of times first. */
export async function runModel(model: string, prompt: string, images: Blob[], width: number, height: number, creds: Creds = studioCreds()) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await runModelOnce(model, prompt, images, width, height, creds);
    } catch (e) {
      if (!(e instanceof Flagged)) throw e;
      if (attempt >= 3) throw new ConvexError("The image service's safety filter blocked this mockup. Try again, or change the wording or image.");
    }
  }
}

type Creds = { accountId?: string; token?: string };

/** The Cloudflare account the Mockup Studio uses. */
const studioCreds = (): Creds => ({ accountId: env.CLOUDFLARE_ACCOUNT_ID, token: env.CLOUDFLARE_API_TOKEN });

/** Catalogue product photos can use a separate Cloudflare account (its own
    daily allowance), so they never eat into the studio's. Falls back to the
    studio account when the CLOUDFLARE_PHOTOS_* keys aren't set. */
export const photoCreds = (): Creds =>
  env.CLOUDFLARE_PHOTOS_ACCOUNT_ID && env.CLOUDFLARE_PHOTOS_API_TOKEN
    ? { accountId: env.CLOUDFLARE_PHOTOS_ACCOUNT_ID, token: env.CLOUDFLARE_PHOTOS_API_TOKEN }
    : studioCreds();

/** Calls Cloudflare Workers AI and returns the image bytes. */
async function runModelOnce(model: string, prompt: string, images: Blob[], width: number, height: number, { accountId, token }: Creds) {
  if (!accountId || !token) throw new ConvexError("The image service isn't connected yet. Add the Cloudflare keys in Convex settings.");

  const form = new FormData();
  form.append("prompt", prompt);
  form.append("width", String(width));
  form.append("height", String(height));
  images.forEach((img, i) => form.append(`input_image_${i}`, img, `input_${i}.${img.type === "image/png" ? "png" : "jpg"}`));

  let res: Response;
  try {
    res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch {
    throw new ConvexError("Couldn't reach the image service. Please try again.");
  }

  const type = res.headers.get("content-type") ?? "";
  if (res.ok && type.startsWith("image/")) return new Uint8Array(await res.arrayBuffer());

  const body: any = await res.json().catch(() => null);
  if (!res.ok || body?.success === false) {
    const msg = String(body?.errors?.[0]?.message ?? body?.error ?? res.statusText ?? "");
    console.error("Cloudflare image error", res.status, msg.slice(0, 500));
    if (/neuron|allocation|quota|daily|4006/i.test(msg) || res.status === 429)
      throw new ConvexError("Today's free image allowance is used up. It resets at 4am Dubai time.");
    if (res.status === 401 || res.status === 403)
      throw new ConvexError("The image service rejected the key. Check the Cloudflare token in Convex settings.");
    if (/nsfw|safety|flagged/i.test(msg)) throw new Flagged(msg);
    throw new ConvexError("The image service couldn't make this mockup. Please try again.");
  }
  const b64 = body?.result?.image ?? body?.image;
  if (typeof b64 !== "string" || !b64) throw new ConvexError("The image service returned no image. Please try again.");
  return fromBase64(b64);
}
