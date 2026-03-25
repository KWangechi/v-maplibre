<script setup lang="ts">
  import type {
    BattlefieldPath,
    BattlefieldPosition,
  } from '~/types/defense-terrain';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  const props = defineProps<{
    paths: BattlefieldPath[];
    currentTime: number;
    positions: BattlefieldPosition[];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `battlefield-${mapId}`,
    style: mapStyle.value,
    center: [78.2, 34.2] as [number, number],
    zoom: 11,
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
        <ExamplesBattlefieldLayers
          :paths="props.paths"
          :current-time="props.currentTime"
          :positions="props.positions"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
