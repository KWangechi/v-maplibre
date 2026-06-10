import { defineAsyncComponent, type Component } from 'vue';

export const VLayerDeckglWindParticle: Component = defineAsyncComponent(() =>
  import('./wind-particle').then((m) => m.VLayerDeckglWindParticle),
);
export type {
  WindDataPoint,
  WindTextureResult,
  GenerateWindTextureOptions,
  ColorStop,
} from './wind-particle';
