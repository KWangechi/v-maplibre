/**
 * `@geoql/v-maplibre/deck.gl` subpath entry.
 *
 * deck.gl visualization layers (Scatterplot, Arc, Hexagon, H3, Trips, GeoArrow,
 * etc.) plus the shared `useDeckOverlay` composable. These require the deck.gl
 * peer dependencies to be installed:
 *
 * `pnpm add @deck.gl/core @deck.gl/layers @deck.gl/mapbox`
 *
 * (plus `@deck.gl/aggregation-layers`, `@deck.gl/geo-layers`,
 * `@deck.gl/mesh-layers`, and `apache-arrow` for the relevant layers).
 *
 * GeoTIFF/COG/Zarr layers live under `@geoql/v-maplibre/geotiff`, and the wind
 * particle layer under `@geoql/v-maplibre/wind`, so installing only the base
 * deck.gl peers never pulls in `@developmentseed/*` or `maplibre-gl-wind`.
 */
export * from './layers/deckgl';
