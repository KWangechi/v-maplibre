<script setup lang="ts">
  import type { ConvoyUnit, ConvoyCheckpoint } from '~/types/defense-convoy';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    convoys: ConvoyUnit[];
    routes: {
      convoyId: string;
      path: [number, number][];
      timestamps: number[];
    }[];
    positions: Record<string, { lng: number; lat: number }>;
    activeCheckpoints: ConvoyCheckpoint[];
    loopedTime: number;
    selectedConvoyId: string | null;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `convoy-${mapId}`,
    style: mapStyle.value,
    center: [72.0, 26.3] as [number, number],
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
        <ExamplesConvoyLayers
          :convoys="convoys"
          :routes="routes"
          :positions="positions"
          :active-checkpoints="activeCheckpoints"
          :looped-time="loopedTime"
          :selected-convoy-id="selectedConvoyId"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
