<script setup lang="ts">
  import type { NodeType } from '~/types/defense-comms';
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Tactical Comms Network - mapcn-vue Examples',
    description:
      'Tactical communications network with HQ, relay, and field unit nodes connected by signal-strength links along the Arunachal Pradesh border.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Tactical Comms Network',
    description:
      'Communication nodes with signal-strength links and live degradation simulation.',
    category: 'Examples',
  });

  const {
    nodes,
    links,
    activeNodeTypes,
    stats,
    nodeTypes,
    toggleNodeType,
    startSimulation,
    cleanup,
  } = useCommsNetwork();

  const panelOpen = ref(true);

  onMounted(() => {
    startSimulation();
  });

  onUnmounted(() => {
    cleanup();
  });

  function handleToggleType(type: NodeType): void {
    toggleNodeType(type);
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    useDeckLayers,
  } from '@geoql/v-maplibre';
  import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';

  const mapOptions = computed(() => ({
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [93.5, 27.5] as [number, number],
    zoom: 10,
  }));

  const { updateLayer } = useDeckLayers();

  const nodes = ref([
    { id: 'TAC-HQ-1', position: [93.4, 27.5], range: 30000, color: [255, 200, 0] },
    { id: 'RELAY-1', position: [93.45, 27.55], range: 20000, color: [0, 200, 150] },
  ]);

  function syncLayers() {
    updateLayer('comms-dots', new ScatterplotLayer({
      id: 'comms-dots',
      data: nodes.value,
      getPosition: (d) => d.position,
      getRadius: 6,
      getFillColor: (d) => [...d.color, 255],
      radiusUnits: 'pixels',
    }));
  }
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VControlScale position="bottom-left" />
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="Tactical Comms Network"
    description="Tactical communications network with HQ, relay, and field unit nodes connected by signal-strength links along the Arunachal Pradesh border region."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesCommsMapContainer
        :nodes="nodes"
        :links="links"
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
          <ExamplesCommsControlPanel
            :active-node-types="activeNodeTypes"
            :stats="stats"
            :node-types="nodeTypes"
            :links="links"
            @toggle-type="handleToggleType"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
