<script setup lang="ts">
  import type {
    ArtilleryPosition,
    RangeFanPolygon,
  } from '~/types/defense-artillery';
  import type { MapMouseEvent } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    positions: ArtilleryPosition[];
    rangeFans: RangeFanPolygon[];
    selectedPositionId: string | null;
  }>();

  const emit = defineEmits<{
    mapClick: [position: [number, number]];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `artillery-${mapId}`,
    style: mapStyle.value,
    center: [71.9, 26.9] as [number, number],
    zoom: 10,
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
        <ExamplesArtilleryLayers
          :positions="positions"
          :range-fans="rangeFans"
          :selected-position-id="selectedPositionId"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
