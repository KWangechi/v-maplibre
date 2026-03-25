<script setup lang="ts">
  import type {
    Sensor,
    ThreatEvent,
    CoverageZone,
  } from '~/types/defense-sensor';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    sensors: Sensor[];
    threats: ThreatEvent[];
    coverageZones: CoverageZone[];
    radiusMultiplier: number;
    pulseTime: number;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `sensor-network-${mapId}`,
    style: mapStyle.value,
    center: [93.5, 27.5] as [number, number],
    zoom: 9,
    pitch: 0,
  }));
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap :key="mapStyle" :options="mapOptions" class="size-full">
        <ExamplesSensorNetworkLayers
          :sensors="sensors"
          :threats="threats"
          :coverage-zones="coverageZones"
          :radius-multiplier="radiusMultiplier"
          :pulse-time="pulseTime"
        />
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
      </VMap>
    </ClientOnly>
  </div>
</template>
