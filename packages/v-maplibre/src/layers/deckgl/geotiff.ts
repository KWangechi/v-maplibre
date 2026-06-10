import { defineAsyncComponent, type Component } from 'vue';

export const VLayerDeckglCOG: Component = defineAsyncComponent(() =>
  import('./cog').then((m) => m.VLayerDeckglCOG),
);
export const VLayerDeckglMosaic: Component = defineAsyncComponent(() =>
  import('./mosaic').then((m) => m.VLayerDeckglMosaic),
);
export type { MosaicSource, MosaicRenderMode, RenderModule } from './mosaic';
export const VLayerDeckglMultiCOG: Component = defineAsyncComponent(() =>
  import('./multi-cog').then((m) => m.VLayerDeckglMultiCOG),
);
export type { MultiCOGComposite } from './multi-cog';
export const VLayerDeckglZarr: Component = defineAsyncComponent(() =>
  import('./zarr').then((m) => m.VLayerDeckglZarr),
);
