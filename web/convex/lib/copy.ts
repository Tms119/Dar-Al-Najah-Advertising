/* House style for customer-facing copy: no em/en dashes and no hyphenated
   marketing words. Product NAMES (e.g. "T-Shirt Printing", "Roll-up Stands")
   are left alone on purpose: they are names, and dropping the hyphen reads as
   a misspelling. Applied by the seed and by maintenance:cleanCopy. */

const WORDS: [RegExp, string][] = [
  [/produced in-house at/g, "produced in our own studio at"],
  [/\bin-house\b/g, "in our own studio"],
  [/\bIn-house\b/g, "In our own studio"],
  [/\be-commerce\b/g, "online stores"],
  [/\bFull-colour\b/g, "Full colour"],
  [/\bFull-wrap\b/g, "Full wrap"],
  [/\bcolour-changing\b/g, "colour changing"],
  [/\bICAO-compliant\b/g, "ICAO compliant"],
  [/\bwater-damaged\b/g, "water damaged"],
  [/\b([Ss])ingle-sided\b/g, "$1ingle sided"],
  [/\b([Dd])ouble-sided\b/g, "$1ouble sided"],
  [/\b([Dd])ie-cut\b/g, "$1ie cut"],
  [/\b([Kk])iss-cut\b/g, "$1iss cut"],
  [/\b([Aa])nti-curl\b/g, "$1nti curl"],
  [/\b([Ss])oft-touch\b/g, "$1oft touch"],
  [/\bspot-UV\b/g, "spot UV"],
  [/\b([Tt])uck-end\b/g, "$1uck end"],
  [/\b([Dd])ri-fit\b/g, "$1ri fit"],
  [/\b([Ss])ame-day\b/g, "$1ame day"],
];

export function cleanCopy(text: string): string {
  let s = text;
  s = s.replace(/(\d)\s*[–—]\s*(\d)/g, "$1 to $2"); // ranges: 24–48 → 24 to 48
  s = s.replace(/\s+[—–]\s+/g, ", "); // clause dashes → comma
  s = s.replace(/[—–]/g, ", ");
  for (const [re, rep] of WORDS) s = s.replace(re, rep);
  return s.replace(/ ,/g, ",").replace(/,\s*,/g, ",");
}
