/**
 * Types for the deck.gl Sentinel-2 multi-band example.
 *
 * Per the app's Rule #1, example-page types live here rather than inline in
 * the `.vue` file.
 */

/** A Sentinel-2 scene (a tile in the public COG archive). */
export interface SentinelScene {
  title: string;
  baseUrl: string;
  center: [number, number];
  zoom: number;
}

/** A band combination that can be composited into RGB. */
export interface SentinelPreset {
  id: string;
  title: string;
  sources: Record<string, string>;
  composite: { r: string; g?: string; b?: string };
}
