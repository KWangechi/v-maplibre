<script setup lang="ts">
  import type {
    CableSegment,
    EezZone,
    LandingPoint,
  } from '~/types/maritime-cables';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    filteredSegments: CableSegment[];
    landingPoints: LandingPoint[];
    eezZones: EezZone[];
    showEez: boolean;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `cables-${mapId}`,
    style: mapStyle.value,
    center: [50, 18] as [number, number],
    zoom: 4.5,
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
        <ExamplesCablesLayers
          :filtered-segments="filteredSegments"
          :landing-points="landingPoints"
          :eez-zones="eezZones"
          :show-eez="showEez"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
