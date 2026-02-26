<script setup lang="ts">
  import type { DronePosition, DroneTrip } from '~/types/drone';
  import { useDeckLayers } from '@geoql/v-maplibre';

  const props = defineProps<{
    tripData: DroneTrip[];
    currentTime: number;
    dronePosition: DronePosition | null;
  }>();

  const ICON_ATLAS =
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png';
  const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
  };

  function getPath(d: unknown): [number, number][] {
    return (d as DroneTrip).path;
  }

  function getTimestamps(d: unknown): number[] {
    return (d as DroneTrip).timestamps;
  }

  function getTripColor(): [number, number, number] {
    return [0, 200, 255];
  }

  function getShadowColor(): [number, number, number] {
    return [0, 60, 130];
  }

  function getDronePosition(d: unknown): [number, number] {
    const p = d as DronePosition;
    return [p.lng, p.lat];
  }

  function getDroneAngle(d: unknown): number {
    return (d as DronePosition).bearing;
  }

  function getDroneIcon(): string {
    return 'marker';
  }

  function getDroneColor(): [number, number, number, number] {
    return [140, 92, 246, 255];
  }

  let TripsLayerClass: typeof import('@deck.gl/geo-layers').TripsLayer | null =
    null;
  let IconLayerClass: typeof import('@deck.gl/layers').IconLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const [geoModule, layersModule] = await Promise.all([
      import('@deck.gl/geo-layers'),
      import('@deck.gl/layers'),
    ]);
    TripsLayerClass = geoModule.TripsLayer;
    IconLayerClass = layersModule.IconLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (!TripsLayerClass || !IconLayerClass) return;

    const shadowLayer = new TripsLayerClass({
      id: 'drone-shadow',
      data: props.tripData,
      getPath,
      getTimestamps,
      getColor: getShadowColor,
      currentTime: props.currentTime,
      trailLength: 120,
      fadeTrail: true,
      widthMinPixels: 10,
      capRounded: true,
      jointRounded: true,
      opacity: 0.3,
    });

    const trailLayer = new TripsLayerClass({
      id: 'drone-trail',
      data: props.tripData,
      getPath,
      getTimestamps,
      getColor: getTripColor,
      currentTime: props.currentTime,
      trailLength: 80,
      fadeTrail: true,
      widthMinPixels: 4,
      capRounded: true,
      jointRounded: true,
      opacity: 0.8,
    });

    updateLayer('drone-shadow', shadowLayer);
    updateLayer('drone-trail', trailLayer);

    const pos = props.dronePosition;
    if (pos) {
      const iconLayer = new IconLayerClass({
        id: 'drone-icon',
        data: [pos],
        iconAtlas: ICON_ATLAS,
        iconMapping: ICON_MAPPING,
        getPosition: getDronePosition,
        getAngle: getDroneAngle,
        getIcon: getDroneIcon,
        getColor: getDroneColor,
        getSize: 96,
        sizeUnits: 'pixels' as const,
        billboard: false,
        pickable: false,
      });
      updateLayer('drone-icon', iconLayer);
    } else {
      removeLayer('drone-icon');
    }
  }

  watch(
    () => [props.tripData, props.currentTime, props.dronePosition],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('drone-shadow');
    removeLayer('drone-trail');
    removeLayer('drone-icon');
  });
</script>

<template>
  <slot></slot>
</template>
