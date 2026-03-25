<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Search & Rescue Grid - mapcn-vue Examples',
    description:
      'SAR grid overlay with probability heat mapping, helicopter sweep paths, and sector tracking for disaster response.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Search & Rescue Grid',
    description:
      'SAR grid with probability zones, animated helicopter sweeps, and sector tracking near Uttarakhand.',
    category: 'Examples',
  });

  const {
    sectors,
    helicopters,
    positions,
    tripData,
    loopedTime,
    isPlaying,
    speed,
    stats,
    markSearched,
    play,
    pause,
    reset,
    cleanup,
  } = useSarGrid();

  const panelOpen = ref(true);

  function handleSectorClick(sectorId: string): void {
    markSearched(sectorId);
  }

  onMounted(() => {
    play();
  });

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
    <VMap :options="{ style: mapStyle, center: [79.5, 30.5], zoom: 11 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Search & Rescue Grid"
    description="SAR grid overlay dividing the search area near Uttarakhand into 24 sectors with probability heat coloring. Two helicopters sweep sectors in boustrophedon patterns, auto-marking areas as searched. Click any sector to toggle its status."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesSarMapContainer
        :sectors="sectors"
        :helicopters="helicopters"
        :positions="positions"
        :trip-data="tripData"
        :looped-time="loopedTime"
        class="size-full"
        @sector-click="handleSectorClick"
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
          <ExamplesSarControlPanel
            :is-playing="isPlaying"
            :speed="speed"
            :stats="stats"
            @play="play"
            @pause="pause"
            @reset="reset"
            @set-speed="(s: number) => (speed = s)"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
