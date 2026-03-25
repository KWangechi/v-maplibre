<script setup lang="ts">
  import type {
    C2Unit,
    C2PatrolPath,
    C2UnitPosition,
    C2Waypoint,
  } from '~/types/defense-drone-c2';
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  const props = defineProps<{
    units: C2Unit[];
    patrolPaths: C2PatrolPath[];
    positions: Record<string, C2UnitPosition>;
    waypoints: C2Waypoint[];
    loopedTime: number;
    selectedUnitId: string | null;
    isPlaying: boolean;
  }>();

  const emit = defineEmits<{
    mapLoaded: [map: MaplibreMap];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();
  const mapRef = ref<MaplibreMap | null>(null);

  const mapOptions = computed(() => ({
    container: `drone-c2-${mapId}`,
    style: mapStyle.value,
    center: [70.5, 26.8] as [number, number],
    zoom: 11,
    pitch: 0,
    bearing: 0,
  }));

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    emit('mapLoaded', map);
  }

  // Follow selected unit continuously; free camera when deselected
  watch(
    () => (props.selectedUnitId ? props.positions[props.selectedUnitId] : null),
    (pos) => {
      if (pos && mapRef.value && props.selectedUnitId) {
        mapRef.value.jumpTo({
          center: [pos.lng, pos.lat],
        });
      }
    },
    { flush: 'post' },
  );
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
        <ExamplesDroneC2Layers
          :units="units"
          :patrol-paths="patrolPaths"
          :positions="positions"
          :waypoints="waypoints"
          :looped-time="loopedTime"
          :selected-unit-id="selectedUnitId"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
