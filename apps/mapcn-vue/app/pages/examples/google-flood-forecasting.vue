<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';
  import { FLOOD_REGIONS } from '~/composables/use-google-flood';
  import type { FloodMarker } from '~/types/flood';

  useSeoMeta({
    title: 'Real-Time Flood Monitoring - mapcn-vue Examples',
    description:
      'Live flood severity, inundation maps, and gauge forecasts powered by Google Flood Forecasting API across 20+ countries.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Real-Time Flood Monitoring',
    description:
      'Live flood severity and gauge forecasts from Google Flood Forecasting API.',
    category: 'Examples',
  });

  const {
    regionCode,
    loading,
    error,
    floodMarkers,
    significantEvents,
    polygons,
    selectedGauge,
    lastFetch,
    getSeverityColor,
    getSeverityRadius,
    selectGauge,
    clearSelection,
    refresh,
  } = useGoogleFlood();

  const panelOpen = ref(true);

  const currentRegion = computed(
    () =>
      FLOOD_REGIONS.find((r) => r.code === regionCode.value) ??
      FLOOD_REGIONS[0]!,
  );

  const mapCenter = computed<[number, number]>(
    () => currentRegion.value.center,
  );
  const mapZoom = computed(() => currentRegion.value.zoom);

  onMounted(() => refresh());

  function handleRegionChange(code: string): void {
    regionCode.value = code;
    clearSelection();
    refresh();
  }

  function handleSelectGauge(marker: FloodMarker): void {
    selectGauge(marker);
  }

  function handleClosePopup(): void {
    clearSelection();
  }

  function handleRefresh(): void {
    refresh();
  }

  function togglePanel(): void {
    panelOpen.value = !panelOpen.value;
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglScatterplot, VControlNavigation } from '@geoql/v-maplibre';

  const { data } = await useFetch('/api/flood-forecasting', {
    method: 'POST',
    query: { endpoint: 'floodStatus:searchLatestFloodStatusByArea' },
    body: { regionCode: 'IN', pageSize: 200, includeNonQualityVerified: true },
  });

  const markers = computed(() =>
    data.value?.floodStatuses?.map(s => ({
      gaugeId: s.gaugeId,
      coordinates: [s.gauge.location.longitude, s.gauge.location.latitude],
      severity: s.severity,
    })) ?? [],
  );
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglScatterplot
      id="flood-gauges"
      :data="markers"
      :get-position="(d) => d.coordinates"
      :get-fill-color="getSeverityColor"
      :get-radius="getSeverityRadius"
      :radius-min-pixels="5"
      :radius-max-pixels="30"
      :pickable="true"
    />
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="Real-Time Flood Monitoring"
    description="Live flood severity, inundation maps, and gauge forecasts from the Google Flood Forecasting API. Select a region, click a gauge marker to see details and forecasts."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesGoogleFloodMap
        :markers="floodMarkers"
        :polygons="polygons"
        :selected-gauge="selectedGauge"
        :center="mapCenter"
        :zoom="mapZoom"
        :get-severity-color="getSeverityColor"
        :get-severity-radius="getSeverityRadius"
        class="size-full"
        @select-gauge="handleSelectGauge"
        @close-popup="handleClosePopup"
      />

      <button
        class="absolute left-4 top-4 z-10 flex size-9 items-center justify-center rounded-lg border border-border/50 bg-background/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
        :class="{
          'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
        }"
        @click="togglePanel"
      >
        <Icon
          :name="
            panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'
          "
          class="size-4"
        />
      </button>

      <div
        v-if="loading && floodMarkers.length === 0"
        class="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-lg border border-border/50 bg-background/90 px-4 py-2 shadow-sm backdrop-blur-sm"
      >
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon
            name="lucide:loader-2"
            class="size-4 animate-spin text-primary"
          />
          Loading flood data…
        </div>
      </div>

      <AnimatePresence>
        <motion.div
          v-if="panelOpen"
          :initial="{ opacity: 0, x: -20, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: -20, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
          class="absolute left-4 top-16 z-10 w-72 max-h-[calc(100%-5rem)] overflow-auto rounded-xl border border-border/50 bg-background/95 shadow-lg backdrop-blur-sm"
        >
          <ExamplesGoogleFloodRegionSelector
            :model-value="regionCode"
            @update:model-value="handleRegionChange"
          />

          <div class="border-t border-border">
            <ExamplesGoogleFloodStatusPanel
              :markers="floodMarkers"
              :loading="loading"
              :error="error"
              :last-fetch="lastFetch"
              @refresh="handleRefresh"
            />
          </div>

          <div class="border-t border-border">
            <ExamplesGoogleFloodGaugeForecastChart
              :forecast="selectedGauge?.forecast"
              :loading="selectedGauge?.forecastLoading ?? false"
            />
          </div>

          <div class="border-t border-border">
            <ExamplesGoogleFloodEventsPanel
              :events="significantEvents"
              :loading="loading"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
