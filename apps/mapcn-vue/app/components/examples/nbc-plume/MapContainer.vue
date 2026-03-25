<script setup lang="ts">
  import type { HazardSource, PlumeZone } from '~/types/defense-nbc';
  import type { MapMouseEvent } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    source: HazardSource | null;
    plumeZones: PlumeZone[];
  }>();

  const emit = defineEmits<{
    mapClick: [position: [number, number]];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `nbc-plume-${mapId}`,
    style: mapStyle.value,
    center: [72.0, 26.3] as [number, number],
    zoom: 11,
    pitch: 0,
    bearing: 0,
  }));

  function handleMapClick(event: MapMouseEvent): void {
    const { lng, lat } = event.lngLat;
    emit('mapClick', [lng, lat]);
  }
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap
        :key="mapStyle"
        :options="mapOptions"
        class="size-full"
        @click="handleMapClick"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <ExamplesNbcPlumeLayers :source="source" :plume-zones="plumeZones" />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
