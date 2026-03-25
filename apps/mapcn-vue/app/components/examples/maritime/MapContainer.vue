<script setup lang="ts">
  import type {
    Ship,
    ShipPosition,
    CoastalRadar,
    EezBoundary,
    RadarCircleDatum,
    TripDatum,
  } from '~/types/defense-maritime';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    ships: Ship[];
    positions: Record<string, ShipPosition>;
    eezBoundary: EezBoundary;
    radars: CoastalRadar[];
    radarCircles: RadarCircleDatum[];
    tripData: TripDatum[];
    loopedTime: number;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `maritime-${mapId}`,
    style: mapStyle.value,
    center: [73.5, 14.5] as [number, number],
    zoom: 6,
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
        <ExamplesMaritimeLayers
          :ships="ships"
          :positions="positions"
          :eez-boundary="eezBoundary"
          :radars="radars"
          :radar-circles="radarCircles"
          :trip-data="tripData"
          :looped-time="loopedTime"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
