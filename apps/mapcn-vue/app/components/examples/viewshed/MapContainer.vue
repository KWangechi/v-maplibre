<script setup lang="ts">
  import type { Observer, ViewshedPolygon } from '~/types/defense-viewshed';
  import type { MapMouseEvent } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    observers: Observer[];
    viewshedPolygons: ViewshedPolygon[];
  }>();

  const emit = defineEmits<{
    mapClick: [position: [number, number]];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `viewshed-${mapId}`,
    style: mapStyle.value,
    center: [77.5, 34.2] as [number, number],
    zoom: 12,
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
        <ExamplesViewshedLayers
          :observers="observers"
          :viewshed-polygons="viewshedPolygons"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
