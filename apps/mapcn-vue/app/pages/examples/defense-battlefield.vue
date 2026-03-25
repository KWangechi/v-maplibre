<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: '3D Battlefield Terrain - mapcn-vue Examples',
    description:
      'Interactive tactical map with animated troop movement replay over the Ladakh region.',
  });

  defineOgImage('MapcnDoc', {
    title: '3D Battlefield Terrain',
    description: 'Interactive 3D terrain with animated troop movement replay.',
    category: 'Examples',
  });

  const {
    units,
    missionPhases,
    activePaths,
    activeUnits,
    positions,
    currentTime,
    selectedPhase,
    isPlaying,
    speed,
    progress,
    activeUnitTypes,
    stats,
    play,
    pause,
    resetAnimation,
    setSpeed,
    seekTo,
    toggleUnitType,
    cleanup,
  } = useBattlefieldTerrain();

  const panelOpen = ref(true);

  onUnmounted(() => {
    cleanup();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                  import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                  import { useDeckLayers } from '@geoql/v-maplibre';
                  import { TripsLayer } from '@deck.gl/geo-layers';
                  import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';

                  const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [78.2, 34.2],
                    zoom: 11,
                  };
                ${SCRIPT_END}

                <template>
                  <VMap :options="mapOptions" class="h-125 w-full">
                    <VControlNavigation position="top-right" />
                  </VMap>
                </template>`;
</script>

<template>
  <ComponentDemo
    title="3D Battlefield Terrain"
    description="Interactive tactical map with animated troop movement replay over the Ladakh region. Military unit tracks rendered as animated trails with mission phase timeline."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesBattlefieldMapContainer
        :paths="activePaths"
        :current-time="currentTime"
        :positions="positions"
        class="size-full"
      />

      <div class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
        <ExamplesBattlefieldMissionInfo :stats="stats" />
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
          class="absolute top-16 left-4 z-10 w-64 max-h-[calc(100%-5rem)] overflow-y-auto overflow-x-hidden rounded-xl bg-background/95 shadow-lg backdrop-blur-sm"
        >
          <ExamplesBattlefieldControlPanel
            :is-playing="isPlaying"
            :speed="speed"
            :progress="progress"
            :mission-phases="missionPhases"
            :current-phase="selectedPhase"
            :units="activeUnits"
            :active-unit-types="activeUnitTypes"
            @play="play"
            @pause="pause"
            @reset="resetAnimation"
            @set-speed="setSpeed"
            @seek="seekTo"
            @toggle-unit="toggleUnitType"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
