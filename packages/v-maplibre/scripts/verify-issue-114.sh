#!/usr/bin/env bash
#
# Empirical end-to-end proof for issue #114.
#
# Packs the library, then in a hermetic temp project verifies:
#   1. A consumer installing ONLY core peers (vue + maplibre-gl) can build a
#      Vite bundle that imports from `@geoql/v-maplibre` — no optional-peer
#      resolution error.
#   2. Importing a deck.gl component from `@geoql/v-maplibre/deck.gl` WITHOUT
#      the deck.gl peers correctly FAILS the build (the peer is genuinely
#      required, not silently bundled).
#   3. After installing the deck.gl peers, the same subpath import builds.
#
# Run from packages/v-maplibre. Requires pnpm.
set -euo pipefail

PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> Packing @geoql/v-maplibre"
(cd "$PKG_DIR" && pnpm pack --pack-destination "$TMP" >/dev/null)
TARBALL="$(ls "$TMP"/*.tgz | head -1)"
echo "    tarball: $TARBALL"

PROJ="$TMP/consumer"
mkdir -p "$PROJ"
cd "$PROJ"
cat > package.json <<'EOF'
{ "name": "issue-114-consumer", "private": true, "type": "module" }
EOF

echo "==> [1/3] core-only install (vue + maplibre-gl)"
pnpm add "$TARBALL" vue maplibre-gl >/dev/null 2>&1
pnpm add -D vite >/dev/null 2>&1
cat > main.ts <<'EOF'
import { VMap } from '@geoql/v-maplibre';
export default VMap;
EOF
cat > vite.config.ts <<'EOF'
import { defineConfig } from 'vite';
export default defineConfig({
  logLevel: 'error',
  build: { lib: { entry: 'main.ts', formats: ['es'], fileName: 'out' } },
});
EOF
if ! pnpm exec vite build > core.log 2>&1; then
  echo "FAIL: core-only build errored"; cat core.log; exit 1
fi
if grep -qiE "optional-peer-dep|@deck.gl|maplibre-gl-wind|maplibre-gl-lidar" core.log; then
  echo "FAIL: core build referenced an optional peer"; cat core.log; exit 1
fi
echo "    PASS: core-only build clean"

echo "==> [2/3] subpath import WITHOUT peers (expect failure)"
cat > main.ts <<'EOF'
import { VLayerDeckglScatterplot } from '@geoql/v-maplibre/deck.gl';
export default VLayerDeckglScatterplot;
EOF
if pnpm exec vite build > nopeer.log 2>&1; then
  echo "FAIL: subpath build unexpectedly succeeded without deck.gl peers"
  cat nopeer.log; exit 1
fi
echo "    PASS: subpath build correctly fails without peers"

echo "==> [3/3] subpath import WITH peers (expect success)"
# The /deck.gl barrel re-exports every deck.gl layer, so its documented peer
# contract is the full deck.gl set (base + aggregation + geo + mesh + arrow),
# not just the base three. Install all of them to match the README contract.
pnpm add @deck.gl/core @deck.gl/layers @deck.gl/mapbox \
  @deck.gl/aggregation-layers @deck.gl/geo-layers @deck.gl/mesh-layers \
  apache-arrow >/dev/null 2>&1
if ! pnpm exec vite build > peer.log 2>&1; then
  echo "FAIL: subpath build errored even with deck.gl peers installed"
  cat peer.log; exit 1
fi
echo "    PASS: subpath build succeeds with peers"

echo "==> issue #114 empirical verification PASSED"
