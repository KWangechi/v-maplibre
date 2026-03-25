<script setup lang="ts">
  import type { CommNode, CommLink } from '~/types/defense-comms';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    nodes: CommNode[];
    links: CommLink[];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `comms-network-${mapId}`,
    style: mapStyle.value,
    center: [93.5, 27.5] as [number, number],
    zoom: 10,
    pitch: 0,
  }));
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap :key="mapStyle" :options="mapOptions" class="size-full">
        <ExamplesCommsLayers :nodes="nodes" :links="links" />
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
      </VMap>
    </ClientOnly>
  </div>
</template>
