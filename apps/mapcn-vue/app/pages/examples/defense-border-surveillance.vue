<script setup lang="ts">
  import type { BorderLayerName } from '~/types/defense-border';
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Border Surveillance Dashboard - mapcn-vue Examples',
    description:
      'Defense border surveillance demo showing the India-China LAC with camera positions, patrol routes, and intrusion detection zones.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Border Surveillance Dashboard',
    description:
      'LAC sector surveillance with 8 cameras, 2 patrols, and 3 intrusion zones.',
    category: 'Examples',
  });

  const {
    borderLine,
    cameras,
    patrols,
    positions,
    intrusionZones,
    visibleLayers,
    loopedTime,
    isPlaying,
    speed,
    toggleLayer,
    startAnimation,
    pauseAnimation,
    setSpeed,
    cleanup,
  } = useBorderSurveillance();

  const panelOpen = ref(true);

  const cameraCount = computed(() => cameras.value.length);

  const activeAlerts = computed(
    () => intrusionZones.value.filter((z) => z.alertLevel === 'high').length,
  );

  function handleToggleLayer(layer: BorderLayerName): void {
    toggleLayer(layer);
  }

  function handleSetSpeed(newSpeed: number): void {
    setSpeed(newSpeed);
  }

  onMounted(() => {
    startAnimation();
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
    <VMap :options="{ style: mapStyle, center: [77.5, 34.2], zoom: 10 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Border Surveillance Dashboard"
    description="Defense surveillance of the India-China LAC (Ladakh sector) with 8 surveillance cameras, 2 animated patrol routes, and 3 intrusion detection zones. Real-time animated trails via deck.gl TripsLayer."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesBorderSurveillanceMapContainer
        :border-line="borderLine"
        :cameras="cameras"
        :patrols="patrols"
        :positions="positions"
        :intrusion-zones="intrusionZones"
        :visible-layers="visibleLayers"
        :looped-time="loopedTime"
        :is-playing="isPlaying"
        class="size-full"
      />

      <div
        v-if="activeAlerts > 0"
        class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
      >
        <div
          class="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive backdrop-blur-sm"
        >
          <Icon name="lucide:shield-alert" class="size-4 shrink-0" />
          <span>{{ activeAlerts }} high-alert intrusion zones active</span>
        </div>
      </div>

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
          <ExamplesBorderSurveillanceControlPanel
            :visible-layers="visibleLayers"
            :is-playing="isPlaying"
            :speed="speed"
            :intrusion-zones="intrusionZones"
            :camera-count="cameraCount"
            @toggle-layer="handleToggleLayer"
            @play="startAnimation"
            @pause="pauseAnimation"
            @set-speed="handleSetSpeed"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
