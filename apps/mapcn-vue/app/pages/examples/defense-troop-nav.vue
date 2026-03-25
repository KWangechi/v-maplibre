<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Ground Troop Navigation - mapcn-vue Examples',
    description:
      'Multi-waypoint route planning for infantry patrols in Ladakh with real Valhalla pedestrian routing and elevation profile.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Ground Troop Navigation',
    description:
      'Multi-waypoint infantry patrol route planning with elevation profile.',
    category: 'Examples',
  });

  const {
    waypoints,
    routeCoords,
    elevationProfile,
    routeStats,
    isLoading,
    addWaypoint,
    removeWaypoint,
    clearRoute,
  } = useTroopNav();

  const panelOpen = ref(true);

  function handleMapClick(position: [number, number]): void {
    addWaypoint(position);
  }

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
    <VMap :options="{ style: mapStyle, center: [77.6, 34.15], zoom: 12 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Ground Troop Navigation"
    description="Multi-waypoint route planning for infantry patrols in Ladakh, India. Click the map to add up to 8 waypoints — routes are fetched via Valhalla pedestrian routing with simulated elevation data for high-altitude terrain."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesTroopNavMapContainer
        :waypoints="waypoints"
        :route-coords="routeCoords"
        :is-loading="isLoading"
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
          <ExamplesTroopNavControlPanel
            :waypoints="waypoints"
            :route-stats="routeStats"
            :elevation-profile="elevationProfile"
            @remove-waypoint="removeWaypoint"
            @clear-route="clearRoute"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
