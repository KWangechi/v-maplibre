<script setup lang="ts">
  import type {
    SarSector,
    SarHelicopter,
    SarHelicopterPosition,
    SarTripDatum,
  } from '~/types/defense-sar';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    sectors: SarSector[];
    helicopters: SarHelicopter[];
    positions: Record<string, SarHelicopterPosition>;
    tripData: SarTripDatum[];
    loopedTime: number;
  }>();

  const emit = defineEmits<{
    sectorClick: [sectorId: string];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `sar-grid-${mapId}`,
    style: mapStyle.value,
    center: [79.5, 30.5] as [number, number],
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
        <ExamplesSarLayers
          :sectors="sectors"
          :helicopters="helicopters"
          :positions="positions"
          :trip-data="tripData"
          :looped-time="loopedTime"
          @sector-click="emit('sectorClick', $event)"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
