import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  existsSync,
} from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const REGISTRY_DIR = join(ROOT, 'registry', 'new-york');
const OUTPUT_DIR = join(ROOT, 'public', 'r');

const REGISTRY_BASE_URL = 'https://mapcn-vue.geoql.in';

interface RegistryFile {
  path: string;
  content: string;
  type: 'registry:ui';
  target: string;
}

interface RegistryItem {
  $schema: string;
  name: string;
  type: 'registry:ui';
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}

interface RegistryIndex {
  $schema: string;
  name: string;
  homepage: string;
  items: Array<{
    name: string;
    type: 'registry:ui';
    title: string;
    description: string;
  }>;
}

interface ComponentMeta {
  title: string;
  description: string;
  deps: string[];
  registryDeps?: string[];
}

const COMPONENTS: Record<string, ComponentMeta> = {
  map: {
    title: 'Map',
    description:
      'A theme-aware MapLibre map component with built-in controls, markers, and popups.',
    deps: ['@geoql/v-maplibre', 'maplibre-gl', '@vueuse/core'],
  },
  'map-layers': {
    title: 'Map Layers',
    description:
      'MapLibre native layer components: GeoJSON, Vector, Raster, Cluster, PMTiles, Image, Video, Canvas, Route.',
    deps: ['@geoql/v-maplibre', 'maplibre-gl'],
    registryDeps: [`${REGISTRY_BASE_URL}/r/map.json`],
  },
  'map-deckgl-core': {
    title: 'deck.gl Core Layers',
    description:
      'High-performance visualization layers: Scatterplot, Arc, Line, Path, Polygon, GeoJSON, Icon, Text, Column, Bitmap, PointCloud, GridCell, SolidPolygon.',
    deps: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/layers',
      '@deck.gl/mapbox',
    ],
    registryDeps: [`${REGISTRY_BASE_URL}/r/map.json`],
  },
  'map-deckgl-aggregation': {
    title: 'deck.gl Aggregation Layers',
    description:
      'Data aggregation layers: Heatmap, Hexagon, Grid, Contour, ScreenGrid.',
    deps: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/aggregation-layers',
      '@deck.gl/mapbox',
    ],
    registryDeps: [`${REGISTRY_BASE_URL}/r/map.json`],
  },
  'map-deckgl-geo': {
    title: 'deck.gl Geo Layers',
    description:
      'Geospatial layers: Trips, MVT, Tile, Tile3D, Terrain, H3Hexagon, H3Cluster, GreatCircle, WMS, S2, Geohash, Quadkey.',
    deps: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/geo-layers',
      '@deck.gl/mapbox',
    ],
    registryDeps: [`${REGISTRY_BASE_URL}/r/map.json`],
  },
  'map-deckgl-mesh': {
    title: 'deck.gl Mesh Layers',
    description: '3D mesh layers: SimpleMesh, Scenegraph (glTF/GLB models).',
    deps: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/mesh-layers',
      '@deck.gl/mapbox',
    ],
    registryDeps: [`${REGISTRY_BASE_URL}/r/map.json`],
  },
  'map-deckgl-raster': {
    title: 'deck.gl Raster Layers',
    description:
      'Cloud-Optimized GeoTIFF (COG) visualization with GPU-accelerated rendering.',
    deps: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/mapbox',
      '@developmentseed/deck.gl-raster',
      'geotiff-geokeys-to-proj4',
    ],
    registryDeps: [`${REGISTRY_BASE_URL}/r/map.json`],
  },
  'map-deckgl-wind': {
    title: 'deck.gl Wind Visualization',
    description:
      'Animated wind particle flow visualization with speed-based color ramps.',
    deps: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/layers',
      '@deck.gl/mapbox',
      'maplibre-gl-wind',
    ],
    registryDeps: [`${REGISTRY_BASE_URL}/r/map.json`],
  },
  'map-control-lidar': {
    title: 'LiDAR Control',
    description:
      'LiDAR point cloud viewer with LAS/LAZ/COPC support and dynamic streaming.',
    deps: ['@geoql/v-maplibre', 'maplibre-gl', 'maplibre-gl-lidar'],
    registryDeps: [`${REGISTRY_BASE_URL}/r/map.json`],
  },
};

function buildRegistryItem(slug: string): RegistryItem | null {
  const meta = COMPONENTS[slug];
  if (!meta) {
    console.warn(`No metadata for component: ${slug}`);
    return null;
  }

  const componentDir = join(REGISTRY_DIR, slug);

  if (!existsSync(componentDir)) {
    console.warn(`Directory not found: ${componentDir}`);
    return null;
  }

  const files: RegistryFile[] = [];

  const entries = readdirSync(componentDir).sort();
  for (const entry of entries) {
    const fullPath = join(componentDir, entry);
    if (!statSync(fullPath).isFile()) continue;
    if (!entry.endsWith('.vue') && !entry.endsWith('.ts')) continue;

    const content = readFileSync(fullPath, 'utf-8');
    files.push({
      path: `registry/new-york/${slug}/${entry}`,
      content,
      type: 'registry:ui',
      target: `components/ui/${slug}/${entry}`,
    });
  }

  if (files.length === 0) {
    console.warn(`No files found in: ${componentDir}`);
    return null;
  }

  const item: RegistryItem = {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: slug,
    type: 'registry:ui',
    title: meta.title,
    description: meta.description,
    dependencies: meta.deps,
    files,
  };

  if (meta.registryDeps && meta.registryDeps.length > 0) {
    item.registryDependencies = meta.registryDeps;
  }

  return item;
}

function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const indexItems: RegistryIndex['items'] = [];
  let built = 0;
  let skipped = 0;

  for (const slug of Object.keys(COMPONENTS)) {
    const item = buildRegistryItem(slug);
    if (!item) {
      skipped++;
      continue;
    }

    const outPath = join(OUTPUT_DIR, `${slug}.json`);
    writeFileSync(outPath, JSON.stringify(item, null, 2) + '\n');
    console.log(`  ✓ ${slug}.json (${item.files.length} files)`);
    built++;

    indexItems.push({
      name: slug,
      type: 'registry:ui',
      title: item.title,
      description: item.description,
    });
  }

  const registryIndex: RegistryIndex = {
    $schema: 'https://shadcn-vue.com/schema/registry.json',
    name: 'mapcn-vue',
    homepage: REGISTRY_BASE_URL,
    items: indexItems,
  };

  const indexPath = join(OUTPUT_DIR, 'registry.json');
  writeFileSync(indexPath, JSON.stringify(registryIndex, null, 2) + '\n');
  console.log(`\n  ✓ registry.json (${indexItems.length} items)`);

  console.log(`\nDone: ${built} built, ${skipped} skipped`);
}

main();
