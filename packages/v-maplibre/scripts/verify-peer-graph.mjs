#!/usr/bin/env node
/**
 * Chunk-graph guard for issue #114.
 *
 * Walks every chunk reachable from `dist/index.js` (the core entry) following
 * BOTH static `import ... from '...'` and dynamic `import('...')` specifiers,
 * and fails if any of them references an optional peer dependency.
 *
 * The core entry must be installable with only `vue`, `maplibre-gl`, and
 * `pmtiles`. If a deck.gl / lidar / wind / starfield / geotiff specifier is
 * reachable from `dist/index.js`, a consumer's bundler (Vite optimizeDeps,
 * Rollup) will try to resolve it and fail with the `__vite-optional-peer-dep`
 * error reported in #114.
 *
 * Run AFTER `vp pack`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const ROOT = join(DIST, 'index.js');

const OPTIONAL_PEERS = [
  '@deck.gl/core',
  '@deck.gl/layers',
  '@deck.gl/mapbox',
  '@deck.gl/aggregation-layers',
  '@deck.gl/geo-layers',
  '@deck.gl/mesh-layers',
  '@luma.gl/core',
  '@luma.gl/engine',
  '@luma.gl/shadertools',
  '@developmentseed/deck.gl-geotiff',
  '@developmentseed/deck.gl-raster',
  '@developmentseed/deck.gl-zarr',
  '@developmentseed/geotiff',
  '@developmentseed/proj',
  '@geoql/maplibre-gl-starfield',
  'apache-arrow',
  'maplibre-gl-lidar',
  'maplibre-gl-wind',
  'three',
  'zarrita',
];

function isOptionalPeer(spec) {
  return OPTIONAL_PEERS.some((p) => spec === p || spec.startsWith(`${p}/`));
}

// Match both `from '...'` (static) and `import('...')` (dynamic) specifiers.
const SPEC_RE = /(?:from\s*|import\s*\(\s*)["']([^"']+)["']/g;

if (!existsSync(ROOT)) {
  console.error(`[verify-peer-graph] missing ${ROOT} — run \`vp pack\` first.`);
  process.exit(2);
}

const visited = new Set();
const queue = [ROOT];
const violations = [];

while (queue.length > 0) {
  const file = queue.shift();
  if (visited.has(file)) continue;
  visited.add(file);

  let code;
  try {
    code = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  for (const match of code.matchAll(SPEC_RE)) {
    const spec = match[1];
    if (isOptionalPeer(spec)) {
      violations.push({ file: file.replace(`${DIST}/`, ''), spec });
      continue;
    }
    // Follow relative chunk imports inside dist/.
    if (spec.startsWith('.')) {
      const target = resolve(dirname(file), spec);
      const candidate = target.endsWith('.js') ? target : `${target}.js`;
      if (existsSync(candidate)) queue.push(candidate);
    }
  }
}

if (violations.length > 0) {
  console.error(
    '[verify-peer-graph] FAIL: optional peers reachable from dist/index.js (core entry):',
  );
  for (const v of violations) {
    console.error(`  ${v.file} -> ${v.spec}`);
  }
  console.error(
    `\nScanned ${visited.size} chunk(s). The core entry must only reference vue / maplibre-gl / pmtiles.`,
  );
  process.exit(1);
}

console.log(
  `[verify-peer-graph] PASS: no optional peers reachable from dist/index.js (scanned ${visited.size} chunk(s)).`,
);
