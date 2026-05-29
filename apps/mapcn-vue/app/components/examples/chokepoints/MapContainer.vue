<script setup lang="ts">
  import type {
    Chokepoint,
    VesselPosition,
    StsEventDatum,
    LanePathDatum,
  } from '~/types/maritime-chokepoints';
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  const props = defineProps<{
    chokepoint: Chokepoint;
    vesselPositions: VesselPosition[];
    stsEventData: StsEventDatum[];
    lanePath: LanePathDatum;
    loopedTime: number;
    hexagonRadius: number;
    elevationScale: number;
    showSts: boolean;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();
  const mapRef = shallowRef<MaplibreMap | null>(null);

  const mapOptions = computed(() => {
    const cp = props.chokepoint;
    return {
      container: `chokepoints-${mapId}`,
      style: mapStyle.value,
      center: cp.center,
      zoom: cp.zoom,
      pitch: 45,
      bearing: 0,
    };
  });

  function handleLoaded(map: MaplibreMap): void {
    mapRef.value = map;
  }

  watch(
    () => props.chokepoint,
    (cp) => {
      mapRef.value?.flyTo({
        center: cp.center,
        zoom: cp.zoom,
        pitch: 45,
        bearing: 0,
        duration: 1600,
        essential: true,
      });
    },
  );
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap
        :key="mapStyle"
        :options="mapOptions"
        class="size-full"
        @loaded="handleLoaded"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <ExamplesChokepointsLayers
          :vessel-positions="vesselPositions"
          :sts-event-data="stsEventData"
          :lane-path="lanePath"
          :looped-time="loopedTime"
          :hexagon-radius="hexagonRadius"
          :elevation-scale="elevationScale"
          :show-sts="showSts"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
