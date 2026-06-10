/**
 * `@geoql/v-maplibre/starfield` subpath entry.
 *
 * Animated starfield background layer. Requires `@geoql/maplibre-gl-starfield`:
 *
 * `pnpm add @geoql/maplibre-gl-starfield`
 */
import { defineAsyncComponent, type Component } from 'vue';

export const VLayerMaplibreStarfield: Component = defineAsyncComponent(() =>
  import('./layers/maplibre/custom/starfield').then((m) => m.StarfieldLayer),
);
