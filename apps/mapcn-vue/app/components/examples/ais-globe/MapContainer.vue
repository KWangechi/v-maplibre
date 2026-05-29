<script setup lang="ts">
  import type { Vessel, VesselPosition, TripDatum } from '~/types/maritime-ais';
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    vessels: Vessel[];
    positions: Record<string, VesselPosition>;
    tripData: TripDatum[];
    loopedTime: number;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapInstance = shallowRef<MaplibreMap | null>(null);

  function handleLoaded(map: MaplibreMap): void {
    mapInstance.value = map;
  }

  const mapOptions = computed(() => ({
    container: `ais-globe-${mapId}`,
    style: mapStyle.value,
    center: [20, 25] as [number, number],
    zoom: 1.6,
    pitch: 0,
    bearing: 0,
  }));
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap
        :key="mapStyle"
        :options="mapOptions"
        projection="globe"
        class="size-full"
        @loaded="handleLoaded"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <ExamplesAisGlobeMapEnhancer :map="mapInstance" />
        <ExamplesAisGlobeLayers
          :vessels="vessels"
          :positions="positions"
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
