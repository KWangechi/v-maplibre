<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Terrain Viewshed Analysis - mapcn-vue Examples',
    description:
      'Interactive terrain viewshed analysis demo. Place observer points and visualize visible terrain areas with adjustable observer height.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Terrain Viewshed Analysis',
    description:
      'Place observers and simulate line-of-sight terrain visibility.',
    category: 'Examples',
  });

  const {
    observers,
    viewshedPolygons,
    observerHeight,
    totalVisibleAreaKm2,
    heightOptions,
    maxObservers,
    addObserver,
    removeObserver,
    clearAll,
    setHeight,
    cleanup,
  } = useViewshed();

  const panelOpen = ref(true);

  function handleMapClick(lngLat: [number, number]): void {
    addObserver(lngLat);
  }

  onUnmounted(() => {
    cleanup();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';

  const colorMode = useColorMode();
  const mapStyle = computed(() =>
    colorMode.value === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  );
  ${SCRIPT_END}

  <template>
    <VMap :options="{ style: mapStyle, center: [77.5, 34.2], zoom: 12 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Terrain Viewshed Analysis"
    description="Click to place observer points and visualize simulated terrain viewshed polygons. Adjust observer height to simulate standing, vehicle, or tower positions."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesViewshedMapContainer
        :observers="observers"
        :viewshed-polygons="viewshedPolygons"
        class="size-full"
        @map-click="handleMapClick"
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
          class="absolute top-16 left-4 z-10 w-64 max-h-[calc(100%-5rem)] overflow-auto rounded-xl bg-background/95 shadow-lg backdrop-blur-sm"
        >
          <ExamplesViewshedControlPanel
            :observers="observers"
            :observer-height="observerHeight"
            :height-options="heightOptions"
            :max-observers="maxObservers"
            :total-visible-area-km2="totalVisibleAreaKm2"
            @set-height="setHeight"
            @remove-observer="removeObserver"
            @clear-all="clearAll"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
