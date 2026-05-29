<script setup lang="ts">
  import type {
    DriftMode,
    DriftStats,
    ParticlePositionDatum,
    ProbabilityHullDatum,
    TripDatum,
    VectorDatum,
  } from '~/types/maritime-drift';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    particlePositionData: ParticlePositionDatum[];
    tripData: TripDatum[];
    probabilityHull: ProbabilityHullDatum;
    vectorData: VectorDatum[];
    datumLng: number;
    datumLat: number;
    mode: DriftMode;
    currentTime: number;
    showHeatmap: boolean;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `drift-${mapId}`,
    style: mapStyle.value,
    center: [73.5, 15.5] as [number, number],
    zoom: 7,
    pitch: 0,
    bearing: 0,
  }));
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap :key="mapStyle" :options="mapOptions" class="size-full">
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <ExamplesDriftLayers
          :particle-position-data="particlePositionData"
          :trip-data="tripData"
          :probability-hull="probabilityHull"
          :vector-data="vectorData"
          :datum-lng="datumLng"
          :datum-lat="datumLat"
          :mode="mode"
          :current-time="currentTime"
          :show-heatmap="showHeatmap"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
