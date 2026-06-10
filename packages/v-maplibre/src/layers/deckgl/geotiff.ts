import { defineAsyncComponent, type Component } from 'vue';

export const VLayerCog: Component = defineAsyncComponent(() =>
  import('./cog').then((m) => m.VLayerCog),
);
export const VLayerMosaic: Component = defineAsyncComponent(() =>
  import('./mosaic').then((m) => m.VLayerMosaic),
);
export type { MosaicSource, MosaicRenderMode, RenderModule } from './mosaic';
export const VLayerMultiCog: Component = defineAsyncComponent(() =>
  import('./multi-cog').then((m) => m.VLayerMultiCog),
);
export type { MultiCogComposite } from './multi-cog';
export const VLayerZarr: Component = defineAsyncComponent(() =>
  import('./zarr').then((m) => m.VLayerZarr),
);
