<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { DrawMode, ZoneType } from '~/types/defense-zone-planner';
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Defense Zone Planner - mapcn-vue Examples',
    description:
      'Draw danger zones (minefields, restricted areas) on the map and visualize safe corridors between them.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Defense Zone Planner',
    description:
      'Interactive minefield and danger zone planning with terra-draw on MapLibre GL.',
    category: 'Examples',
  });

  const {
    zones,
    drawMode,
    activeZoneType,
    initDraw,
    setDrawMode,
    removeZone,
    clearZones,
    cleanup,
  } = useZonePlanner();

  const panelOpen = ref(true);

  function handleMapLoaded(map: MaplibreMap): void {
    map.once('style.load', () => {
      initDraw(map);
    });
    if (map.isStyleLoaded()) {
      initDraw(map);
    }
  }

  function handleSetMode(mode: DrawMode): void {
    setDrawMode(mode);
  }

  function handleSetZoneType(type: ZoneType): void {
    activeZoneType.value = type;
  }

  function handleRemoveZone(id: string): void {
    removeZone(id);
  }

  function handleClearAll(): void {
    clearZones();
  }

  onUnmounted(() => {
    cleanup();
  });

  const { cartoLightStyle, cartoDarkStyle } = useMapStyle();

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';

  const colorMode = useColorMode();
  const mapStyle = computed(() =>
    colorMode.value === 'dark'
      ? '${cartoDarkStyle}'
      : '${cartoLightStyle}',
  );
  ${SCRIPT_END}

  <template>
    <VMap :options="{ style: mapStyle, center: [71.5, 26.5], zoom: 11 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Defense Zone Planner"
    description="Draw danger zones (minefields, restricted areas, hazards) on the map using terra-draw. Pre-placed example zones in the Thar Desert, Rajasthan with polygon area calculations and zone management."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesZonePlannerMapContainer
        :zones="zones"
        class="size-full"
        @map-loaded="handleMapLoaded"
      />

      <button
        class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg border border-border/50 bg-background/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
        :class="{
          'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
        }"
        @click="panelOpen = !panelOpen"
      >
        <Icon
          :name="
            panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'
          "
          class="size-4"
        />
      </button>

      <AnimatePresence>
        <motion.div
          v-if="panelOpen"
          :initial="{ opacity: 0, x: -20, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: -20, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
          class="absolute top-16 left-4 z-10 w-64 rounded-xl bg-background/95 shadow-lg backdrop-blur-sm"
        >
          <ExamplesZonePlannerControlPanel
            :zones="zones"
            :draw-mode="drawMode"
            :active-zone-type="activeZoneType"
            @set-mode="handleSetMode"
            @set-zone-type="handleSetZoneType"
            @remove-zone="handleRemoveZone"
            @clear-all="handleClearAll"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
