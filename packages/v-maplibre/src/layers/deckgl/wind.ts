import { defineAsyncComponent, type Component } from 'vue';

export const VLayerWindParticle: Component = defineAsyncComponent(() =>
  import('./wind-particle').then((m) => m.VLayerWindParticle),
);
export type {
  WindDataPoint,
  WindTextureResult,
  GenerateWindTextureOptions,
  ColorStop,
} from './wind-particle';
