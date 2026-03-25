<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Air Defense Radar - mapcn-vue Examples',
    description:
      'Layered air defense radar coverage demo with SHORAD, MRSAM, and LRSAM tiers, altitude filtering, and animated radar sweep.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Air Defense Radar',
    description:
      'Visualize layered radar coverage at different altitudes with SAM site positions.',
    category: 'Examples',
  });

  const {
    coveragePolygons,
    sweepLines,
    siteData,
    labelData,
    sweepAngle,
    sweepSpeed,
    activeAltitude,
    activeTiers,
    stats,
    tierConfigs,
    setAltitude,
    toggleTier,
    startSweep,
    cleanup,
  } = useAirDefense();

  const panelOpen = ref(true);

  onMounted(() => {
    startSweep();
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
    <VMap :options="{ style: mapStyle, center: [70.9, 26.9], zoom: 8 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Air Defense Radar"
    description="Layered air defense radar coverage around Jaisalmer with SHORAD, MRSAM, and LRSAM tiers. Toggle altitude layers and radar tiers to visualize coverage gaps with animated radar sweep."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesAirDefenseMapContainer
        :coverage-polygons="coveragePolygons"
        :sweep-lines="sweepLines"
        :site-data="siteData"
        :label-data="labelData"
        :sweep-angle="sweepAngle"
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
          <ExamplesAirDefenseControlPanel
            :active-altitude="activeAltitude"
            :active-tiers="activeTiers"
            :tier-configs="tierConfigs"
            :stats="stats"
            :sweep-speed="sweepSpeed"
            @set-altitude="setAltitude"
            @toggle-tier="toggleTier"
            @update:sweep-speed="sweepSpeed = $event"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
