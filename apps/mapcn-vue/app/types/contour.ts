/**
 * Types for the deck.gl Contour Layer example.
 *
 * Per the app's Rule #1, example-page types live here rather than inline in
 * the `.vue` file.
 */

/** A single point contributing to the density aggregation. */
export interface ContourPoint {
  position: [number, number];
}

/** A Gaussian cluster of points used to build the demo dataset. */
export interface ContourCluster {
  center: [number, number];
  count: number;
  sigmaLng: number;
  sigmaLat: number;
}
