import { ConvexError } from "convex/values";

/** Trims and length-checks a user-supplied string, throwing a readable error. */
export function text(s: string, max: number, field: string, { required = false } = {}) {
  const t = s.trim();
  if (required && !t) throw new ConvexError(`${field} is required`);
  if (t.length > max) throw new ConvexError(`${field} must be at most ${max} characters`);
  return t;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Same as text(), but empty input is rejected. */
export const requiredText = (s: string, max: number, field: string) => text(s, max, field, { required: true });
