<script setup lang="ts">
  import type {
    CoveragePolygon,
    SweepLineDatum,
    SiteDatum,
    SiteLabelDatum,
  } from '~/types/defense-air-defense';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    coveragePolygons: CoveragePolygon[];
    sweepLines: SweepLineDatum[];
    siteData: SiteDatum[];
    labelData: SiteLabelDatum[];
    sweepAngle: number;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `air-defense-${mapId}`,
    style: mapStyle.value,
    center: [70.9, 26.9] as [number, number],
    zoom: 8,
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
        <ExamplesAirDefenseLayers
          :coverage-polygons="coveragePolygons"
          :sweep-lines="sweepLines"
          :site-data="siteData"
          :label-data="labelData"
          :sweep-angle="sweepAngle"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
