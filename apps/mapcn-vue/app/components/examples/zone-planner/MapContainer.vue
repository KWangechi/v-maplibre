<script setup lang="ts">
  import type { DangerZone } from '~/types/defense-zone-planner';
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    zones: DangerZone[];
  }>();

  const emit = defineEmits<{
    mapLoaded: [map: MaplibreMap];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `zone-planner-${mapId}`,
    style: mapStyle.value,
    center: [71.5, 26.5] as [number, number],
    zoom: 11,
    pitch: 0,
    bearing: 0,
  }));

  function handleMapLoad(map: MaplibreMap): void {
    emit('mapLoaded', map);
  }
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap
        :key="mapStyle"
        :options="mapOptions"
        class="size-full"
        @loaded="handleMapLoad"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <ExamplesZonePlannerLayers :zones="zones" />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
