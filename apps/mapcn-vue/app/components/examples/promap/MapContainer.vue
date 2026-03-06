<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { PickingInfo } from '@deck.gl/core';
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VControlLegend,
    VLayerDeckglScatterplot,
    VPopup,
    type CategoryLegendItem,
  } from '@geoql/v-maplibre';
  import type {
    ZipRenderPoint,
    ZipDataPoint,
    QuintileBucket,
    ViewMode,
  } from '~/types/promap';
  import { boundsToViewport } from '~/types/promap';
  import {
    formatPrice,
    formatChange,
    formatPopulation,
  } from '~/composables/use-promap-data';

  const props = defineProps<{
    renderPoints: ZipRenderPoint[];
    legendBuckets: QuintileBucket[];
    hoveredZip: ZipDataPoint | null;
    viewMode: ViewMode;
    localView: boolean;
    mapStyle: string;
  }>();

  const emit = defineEmits<{
    viewportChange: [bounds: ReturnType<typeof boundsToViewport>];
    hoverZip: [zip: ZipDataPoint | null];
    mapLoad: [map: MaplibreMap];
  }>();

  const mapId = useId();
  const mapRef = shallowRef<MaplibreMap | null>(null);

  const mapOptions = computed(() => ({
    container: `promap-${mapId}`,
    style: props.mapStyle,
    center: [-98.5, 39.8] as [number, number],
    zoom: 3.8,
    minZoom: 2,
    maxZoom: 16,
  }));

  const legendTitle = computed(() => {
    const base = props.viewMode === 'levels' ? 'Median Price' : 'YoY Change';
    return props.localView ? `${base} (local)` : base;
  });

  const legendItems = computed((): CategoryLegendItem[] =>
    props.legendBuckets.map((bucket, i) => ({
      value: i,
      label: bucket.label,
      color: `rgb(${bucket.color[0]}, ${bucket.color[1]}, ${bucket.color[2]})`,
      visible: true,
    })),
  );

  function getPosition(d: unknown): [number, number] {
    return (d as ZipRenderPoint).coordinates;
  }

  function getRadius(d: unknown): number {
    return (d as ZipRenderPoint).radius;
  }

  function getFillColor(d: unknown): [number, number, number, number] {
    return (d as ZipRenderPoint).fillColor;
  }

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    emit('mapLoad', map);

    // Emit initial viewport
    const bounds = map.getBounds();
    emit('viewportChange', boundsToViewport(bounds));

    // Track viewport changes
    map.on('moveend', () => {
      const b = map.getBounds();
      emit('viewportChange', boundsToViewport(b));
    });
  }

  function handleHover(info: PickingInfo): void {
    if (info.object) {
      emit('hoverZip', (info.object as ZipRenderPoint).data);
    } else {
      emit('hoverZip', null);
    }
  }

  /** Fly to coordinates (used by search) */
  function flyTo(coords: [number, number], zoom = 10): void {
    mapRef.value?.flyTo({
      center: coords,
      zoom,
      duration: 1500,
    });
  }

  defineExpose({ flyTo });
</script>

<template>
  <ClientOnly>
    <VMap
      :key="mapStyle"
      :options="mapOptions"
      class="size-full"
      @loaded="handleMapLoad"
    >
      <VControlNavigation position="top-right" />
      <VControlScale position="bottom-left" />
      <VControlLegend
        :layer-ids="['promap-bubbles']"
        type="category"
        :items="legendItems"
        :title="legendTitle"
        position="bottom-left"
        :interactive="false"
      />

      <VLayerDeckglScatterplot
        id="promap-bubbles"
        :data="renderPoints"
        :get-position="getPosition"
        :get-radius="getRadius"
        :get-fill-color="getFillColor"
        :radius-min-pixels="2"
        :radius-max-pixels="40"
        :opacity="0.85"
        :pickable="true"
        :auto-highlight="true"
        :highlight-color="[255, 255, 255, 100]"
        :radius-scale="1"
        :anti-aliasing="true"
        @hover="handleHover"
      />

      <!-- Hover popup -->
      <VPopup
        v-if="hoveredZip"
        :coordinates="hoveredZip.coordinates"
        :options="{
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          className: 'promap-hover-popup',
        }"
      >
        <div class="promap-popup-content">
          <p class="promap-popup-location">
            {{ hoveredZip.city }}, {{ hoveredZip.state }}
            {{ hoveredZip.zip }}
          </p>
          <p v-if="viewMode === 'levels'" class="promap-popup-value">
            {{ formatPrice(hoveredZip.price) }}
          </p>
          <p v-else class="promap-popup-value">
            {{ formatChange(hoveredZip.priceChange) }}
          </p>
          <p v-if="hoveredZip.metro" class="promap-popup-detail">
            {{ hoveredZip.metro }}
          </p>
          <p class="promap-popup-detail">
            Pop: {{ formatPopulation(hoveredZip.population) }}
          </p>
        </div>
      </VPopup>
    </VMap>
    <template #fallback>
      <div class="size-full animate-pulse bg-muted"></div>
    </template>
  </ClientOnly>
</template>

<style>
  .promap-hover-popup .maplibregl-popup-content {
    background: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
    border: 1px solid hsl(var(--border));
  }

  .promap-hover-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
    border-top-color: hsl(var(--popover));
  }

  .promap-hover-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip {
    border-bottom-color: hsl(var(--popover));
  }

  .promap-hover-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip {
    border-right-color: hsl(var(--popover));
  }

  .promap-hover-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip {
    border-left-color: hsl(var(--popover));
  }

  .promap-popup-content {
    font-family: inherit;
  }

  .promap-popup-location {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .promap-popup-value {
    font-size: 16px;
    font-weight: 700;
    margin-top: 2px;
  }

  .promap-popup-detail {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 2px;
  }
</style>
