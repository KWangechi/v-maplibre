export type SpectralBand = 'visual' | 'thermal' | 'nightvision';

export type Orientation = 'vertical' | 'horizontal';

export interface SpectralPair {
  id: string;
  label: string;
  before: SpectralBand;
  after: SpectralBand;
}

export interface RasterPaintConfig {
  'raster-hue-rotate'?: number;
  'raster-saturation'?: number;
  'raster-brightness-min'?: number;
  'raster-brightness-max'?: number;
  'raster-contrast'?: number;
  'raster-opacity'?: number;
}
