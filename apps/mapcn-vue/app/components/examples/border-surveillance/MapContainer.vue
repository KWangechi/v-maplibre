<script setup lang="ts">
  import type {
    BorderCamera,
    BorderPatrolRoute,
    BorderPatrolPosition,
    IntrusionZone,
    BorderLayerName,
  } from '~/types/defense-border';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  const props = defineProps<{
    borderLine: [number, number][];
    cameras: BorderCamera[];
    patrols: BorderPatrolRoute[];
    positions: Record<string, BorderPatrolPosition>;
    intrusionZones: IntrusionZone[];
    visibleLayers: Set<BorderLayerName>;
    loopedTime: number;
    isPlaying: boolean;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `border-surv-${mapId}`,
    style: mapStyle.value,
    center: [77.5, 34.2] as [number, number],
    zoom: 10,
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
        <ExamplesBorderSurveillanceLayers
          :border-line="borderLine"
          :cameras="cameras"
          :patrols="patrols"
          :positions="positions"
          :intrusion-zones="intrusionZones"
          :visible-layers="visibleLayers"
          :looped-time="loopedTime"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
