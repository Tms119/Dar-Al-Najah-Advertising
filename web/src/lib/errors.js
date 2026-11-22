import { ConvexError } from 'convex/values';

/** User-facing text for a failed Convex call: the server's own message for
    expected errors (validation, limits), a generic fallback for anything else. */
export function errorMessage(e, fallback = 'Something went wrong. Please try again.') {
  return e instanceof ConvexError ? String(e.data) : fallback;
}
