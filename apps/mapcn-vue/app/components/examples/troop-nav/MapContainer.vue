<script setup lang="ts">
  import type { TroopWaypoint } from '~/types/defense-troop-nav';
  import type { MapMouseEvent } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    waypoints: TroopWaypoint[];
    routeCoords: [number, number][];
    isLoading: boolean;
  }>();

  const emit = defineEmits<{
    mapClick: [position: [number, number]];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `troop-nav-${mapId}`,
    style: mapStyle.value,
    center: [77.6, 34.15] as [number, number],
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
        <ExamplesTroopNavLayers
          :waypoints="waypoints"
          :route-coords="routeCoords"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>

    <div
      v-if="isLoading"
      class="absolute top-4 right-14 z-10 flex items-center gap-2 rounded-lg border border-border/50 bg-background/95 px-3 py-1.5 text-xs backdrop-blur-sm"
    >
      <Icon name="lucide:loader-2" class="size-3.5 animate-spin" />
      <span>Routing...</span>
    </div>
  </div>
</template>
