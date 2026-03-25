<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'NBC Plume Dispersion - mapcn-vue Examples',
    description:
      'NBC hazard plume dispersion modeling with wind-driven Gaussian dispersion zones on a MapLibre map.',
  });

  defineOgImage('MapcnDoc', {
    title: 'NBC Plume Dispersion',
    description:
      'Model nuclear, biological, and chemical hazard plume spread with wind control.',
    category: 'Examples',
  });

  const {
    source,
    plumeZones,
    windDirection,
    windSpeed,
    stats,
    isSimulating,
    hazardType,
    expansion,
    placeSource,
    reset,
    cleanup,
  } = useNbcPlume();

  const panelOpen = ref(true);

  function handleMapClick(lngLat: [number, number]): void {
    placeSource(lngLat);
  }

  function handleWindDirection(value: number): void {
    windDirection.value = value;
  }

  function handleWindSpeed(value: number): void {
    windSpeed.value = value;
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
    <VMap :options="{ style: mapStyle, center: [72.0, 26.3], zoom: 11 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="NBC Plume Dispersion"
    description="Click to place a hazard source and model wind-driven NBC plume dispersion with lethal, danger, and caution zones using Gaussian dispersion."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesNbcPlumeMapContainer
        :source="source"
        :plume-zones="plumeZones"
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
          <ExamplesNbcPlumeControlPanel
            :wind-direction="windDirection"
            :wind-speed="windSpeed"
            :stats="stats"
            :is-simulating="isSimulating"
            :has-source="!!source"
            :hazard-type="hazardType"
            :expansion="expansion"
            @update:wind-direction="handleWindDirection"
            @update:wind-speed="handleWindSpeed"
            @update:hazard-type="hazardType = $event"
            @reset="reset"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
