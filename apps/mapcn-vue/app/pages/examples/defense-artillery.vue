<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Artillery Range Planner - mapcn-vue Examples',
    description:
      'Interactive artillery range planning demo with range fan polygons, weapon types, and bearing control on a MapLibre map.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Artillery Range Planner',
    description:
      'Place gun positions and visualize range fans with min/max range arcs.',
    category: 'Examples',
  });

  const {
    positions,
    selectedPositionId,
    activeWeaponType,
    rangeFans,
    weaponConfigs,
    addPosition,
    removePosition,
    clearAll,
    selectPosition,
    setWeaponType,
    updateBearing,
    cleanup,
  } = useArtilleryPlanner();

  const panelOpen = ref(true);

  function handleMapClick(lngLat: [number, number]): void {
    addPosition(lngLat);
  }

  function handleSelectPosition(id: string | null): void {
    selectPosition(selectedPositionId.value === id ? null : id);
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
    <VMap :options="{ style: mapStyle, center: [71.9, 26.9], zoom: 10 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Artillery Range Planner"
    description="Click to place artillery positions and visualize range fan polygons with min/max range arcs. Supports howitzers, mortars, and MLRS with adjustable bearing."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesArtilleryMapContainer
        :positions="positions"
        :range-fans="rangeFans"
        :selected-position-id="selectedPositionId"
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
          <ExamplesArtilleryControlPanel
            :positions="positions"
            :selected-position-id="selectedPositionId"
            :active-weapon-type="activeWeaponType"
            :weapon-configs="weaponConfigs"
            @select-position="handleSelectPosition"
            @set-weapon-type="setWeaponType"
            @update-bearing="updateBearing"
            @remove-position="removePosition"
            @clear-all="clearAll"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
