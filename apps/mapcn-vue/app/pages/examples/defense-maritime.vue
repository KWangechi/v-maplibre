<script setup lang="ts">
  import type { ShipType } from '~/types/defense-maritime';
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Maritime Domain Awareness - mapcn-vue Examples',
    description:
      'Indian Navy coastal surveillance with ship tracking, EEZ boundary, and coastal radar coverage.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Maritime Domain Awareness',
    description:
      "Ship tracking, EEZ monitoring, and coastal radar coverage along India's western coast.",
    category: 'Examples',
  });

  const {
    ships,
    positions,
    eezBoundary,
    radars,
    radarCircles,
    tripData,
    activeShipTypes,
    stats,
    loopedTime,
    isPlaying,
    speed,
    toggleShipType,
    play,
    pause,
    reset,
    cleanup,
  } = useMaritime();

  const panelOpen = ref(true);

  function handleToggleShipType(type: ShipType): void {
    toggleShipType(type);
  }

  function handleSetSpeed(s: number): void {
    speed.value = s;
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
    <VMap :options="{ style: mapStyle, center: [73.5, 14.5], zoom: 6 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Maritime Domain Awareness"
    description="Indian Navy western coast surveillance tracking 6 ships across EEZ boundary with coastal radar coverage. Animated ship movement via deck.gl TripsLayer with type filtering and situational stats."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesMaritimeMapContainer
        :ships="ships"
        :positions="positions"
        :eez-boundary="eezBoundary"
        :radars="radars"
        :radar-circles="radarCircles"
        :trip-data="tripData"
        :looped-time="loopedTime"
        class="size-full"
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
          <ExamplesMaritimeControlPanel
            :active-ship-types="activeShipTypes"
            :is-playing="isPlaying"
            :speed="speed"
            :stats="stats"
            @play="play"
            @pause="pause"
            @reset="reset"
            @set-speed="handleSetSpeed"
            @toggle-ship-type="handleToggleShipType"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
