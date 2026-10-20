/**
 * CSP-safe Zarr codecs.
 *
 * `zarrita` resolves the `zstd` and `blosc` chunk codecs to `numcodecs`, whose
 * Emscripten build creates a helper function with the global `Function`
 * constructor at module init. That is an `eval` under the eyes of the
 * Content-Security-Policy, and this app ships a nonce-based policy without
 * `'unsafe-eval'` (securityheaders.com A+). Every chunk decode therefore
 * failed with:
 *
 *   EvalError: Evaluating a string as JavaScript violates the following
 *   Content Security Policy directive because 'unsafe-eval' is not an allowed
 *   source of script
 *
 * The codecs below are pure JavaScript (no `eval`, no WebAssembly) and are
 * registered into zarrita's exported codec registry, so the rest of zarrita —
 * including the Zarr v3 sharding codec — keeps working unchanged.
 *
 * - `zstd`  → `fzstd` (pure JS Zstandard decompressor).
 * - `blosc` → Blosc container parsing + the byte-shuffle inverse filter, with
 *   Zstandard frames as the inner codec.
 */

import { decompress as zstdDecompress } from 'fzstd';
import * as zarr from 'zarrita';

/** Zstandard frame magic number (`0xFD2FB528`, little endian). */
const ZSTD_MAGIC = [0x28, 0xb5, 0x2f, 0xfd];

/** Blosc header flag: the payload was stored uncompressed. */
const BLOSC_FLAG_MEMCPYED = 0x04;

/** Blosc header flag: a byte-shuffle filter was applied to the payload. */
const BLOSC_FLAG_SHUFFLE = 0x01;

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset]! |
      (bytes[offset + 1]! << 8) |
      (bytes[offset + 2]! << 16) |
      (bytes[offset + 3]! << 24)) >>>
    0
  );
}

function isZstdFrame(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === ZSTD_MAGIC[0] &&
    bytes[1] === ZSTD_MAGIC[1] &&
    bytes[2] === ZSTD_MAGIC[2] &&
    bytes[3] === ZSTD_MAGIC[3]
  );
}

/**
 * Inverse of Blosc's byte-shuffle filter.
 *
 * The filter groups the bytes of every `typesize`-byte element by their
 * position inside the element, i.e. `shuffled[p * count + e] = plain[e *
 * typesize + p]`.
 */
function unshuffle(
  src: Uint8Array,
  typesize: number,
  length: number,
): Uint8Array {
  const dst = new Uint8Array(length);
  const count = Math.floor(length / typesize);
  for (let p = 0; p < typesize; p++) {
    const srcBase = p * count;
    for (let e = 0; e < count; e++) {
      dst[e * typesize + p] = src[srcBase + e]!;
    }
  }
  // Trailing bytes of a block whose length is not a multiple of the type size.
  for (let i = count * typesize; i < length; i++) {
    dst[i] = src[i]!;
  }
  return dst;
}

function decodeZstd(bytes: Uint8Array): Uint8Array {
  if (!isZstdFrame(bytes)) {
    throw new Error(
      'zarr-codecs: expected a Zstandard frame but the payload has a different magic number',
    );
  }
  return new Uint8Array(zstdDecompress(bytes));
}

/**
 * Decode a Blosc (v1/v2) buffer.
 *
 * Layout: a 16 byte header, a table with one 32 bit offset per block, and
 * then the blocks themselves. Every block is a 32 bit length followed by a
 * Zstandard frame.
 */
function decodeBlosc(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 16) {
    throw new Error('zarr-codecs: truncated Blosc header');
  }
  const flags = bytes[2]!;
  const typesize = bytes[3]!;
  const nbytes = readUint32LE(bytes, 4);
  const blocksize = readUint32LE(bytes, 8);

  if (flags & BLOSC_FLAG_MEMCPYED) {
    return bytes.slice(16, 16 + nbytes);
  }
  if (blocksize === 0) {
    throw new Error('zarr-codecs: invalid Blosc block size');
  }

  const blockCount = Math.ceil(nbytes / blocksize);
  const out = new Uint8Array(nbytes);
  for (let i = 0; i < blockCount; i++) {
    const start = readUint32LE(bytes, 16 + i * 4);
    const frameLength = readUint32LE(bytes, start);
    const frame = bytes.subarray(start + 4, start + 4 + frameLength);
    const blockLength = Math.min(blocksize, nbytes - i * blocksize);
    const raw = decodeZstd(frame);
    if (raw.length !== blockLength) {
      throw new Error(
        `zarr-codecs: Blosc block ${i} decoded to ${raw.length} bytes, expected ${blockLength}`,
      );
    }
    const plain =
      flags & BLOSC_FLAG_SHUFFLE ? unshuffle(raw, typesize, blockLength) : raw;
    out.set(plain, i * blocksize);
  }
  return out;
}

let registered = false;

/**
 * Register the CSP-safe `zstd` and `blosc` codecs on zarrita's registry.
 *
 * Safe to call more than once; the codecs are only installed the first time.
 */
export function registerCspSafeZarrCodecs(): void {
  if (registered) return;
  registered = true;

  const zstdEntry = {
    kind: 'bytes_to_bytes' as const,
    fromConfig: () => ({
      kind: 'bytes_to_bytes' as const,
      encode: async (_data: Uint8Array): Promise<Uint8Array> => {
        throw new Error(
          'zarr-codecs: encoding Zstandard chunks is not supported',
        );
      },
      decode: async (data: Uint8Array): Promise<Uint8Array> => decodeZstd(data),
    }),
  };

  const bloscEntry = {
    kind: 'bytes_to_bytes' as const,
    fromConfig: () => ({
      kind: 'bytes_to_bytes' as const,
      encode: async (_data: Uint8Array): Promise<Uint8Array> => {
        throw new Error('zarr-codecs: encoding Blosc chunks is not supported');
      },
      decode: async (data: Uint8Array): Promise<Uint8Array> =>
        decodeBlosc(data),
    }),
  };

  zarr.registry.set('zstd', async () => zstdEntry);
  zarr.registry.set('numcodecs.zstd', async () => zstdEntry);
  zarr.registry.set('blosc', async () => bloscEntry);
  zarr.registry.set('numcodecs.blosc', async () => bloscEntry);
}
