import type { Slice } from 'zarrita';
import type { Texture } from '@luma.gl/core';

/**
 * A Zarr v3 selection: one entry per array dimension — an index, a range or
 * `null` for the full extent of that dimension.
 */
export type ZarrSelection = (number | Slice | null)[];

/**
 * Tile payload handed to the render pipeline of a Zarr layer: the decoded
 * pixels plus the size of the tile they describe.
 */
export interface ZarrTileData {
  width: number;
  height: number;
  byteLength?: number;
  data: Float32Array | Int8Array;
}

/**
 * Tile payload of the AEF mosaic: the embedding bands are uploaded to the GPU
 * as an int8 texture, so the tile carries the texture instead of the pixels.
 */
export interface AefTileData {
  width: number;
  height: number;
  byteLength: number;
  texture: Texture;
}
