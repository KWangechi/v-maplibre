import { describe, it, expect } from 'vitest';
import * as deckgl from '../src/deckgl';
import * as geotiff from '../src/geotiff';
import * as wind from '../src/wind';
import * as starfield from '../src/starfield';
import * as lidar from '../src/lidar';
import * as root from '../src/index';

describe('Subpath Exports (issue #114)', () => {
  describe('@geoql/v-maplibre/deck.gl', () => {
    it('exports core deck.gl layers + shared composable', () => {
      expect(deckgl.VLayerDeckglScatterplot).toBeDefined();
      expect(deckgl.VLayerDeckglArc).toBeDefined();
      expect(deckgl.VLayerDeckglGeoArrowScatterplot).toBeDefined();
      expect(typeof deckgl.useDeckOverlay).toBe('function');
    });

    it('does NOT re-export geotiff or wind layers', () => {
      expect((deckgl as Record<string, unknown>).VLayerCog).toBeUndefined();
      expect(
        (deckgl as Record<string, unknown>).VLayerWindParticle,
      ).toBeUndefined();
    });
  });

  describe('@geoql/v-maplibre/geotiff', () => {
    it('exports COG/Mosaic/MultiCOG/Zarr layers', () => {
      expect(geotiff.VLayerCog).toBeDefined();
      expect(geotiff.VLayerMosaic).toBeDefined();
      expect(geotiff.VLayerMultiCog).toBeDefined();
      expect(geotiff.VLayerZarr).toBeDefined();
    });
  });

  describe('@geoql/v-maplibre/wind', () => {
    it('exports the wind particle layer', () => {
      expect(wind.VLayerWindParticle).toBeDefined();
    });
  });

  describe('@geoql/v-maplibre/starfield', () => {
    it('exports the starfield layer', () => {
      expect(starfield.VLayerStarfield).toBeDefined();
    });
  });

  describe('@geoql/v-maplibre/lidar', () => {
    it('exports the lidar control', () => {
      expect(lidar.VControlLidar).toBeDefined();
    });
  });

  describe('root entry (@geoql/v-maplibre)', () => {
    it('exports core map components and controls', () => {
      expect(root.VMap).toBeDefined();
      expect(root.VMarker).toBeDefined();
      expect(root.VPopup).toBeDefined();
      expect(root.VControlScale).toBeDefined();
      expect(root.VLayerMaplibreGeojson).toBeDefined();
    });

    it('does NOT export optional-peer layers/controls', () => {
      const r = root as Record<string, unknown>;
      expect(r.VLayerDeckglScatterplot).toBeUndefined();
      expect(r.VLayerCog).toBeUndefined();
      expect(r.VLayerWindParticle).toBeUndefined();
      expect(r.VLayerStarfield).toBeUndefined();
      expect(r.VControlLidar).toBeUndefined();
    });
  });
});
