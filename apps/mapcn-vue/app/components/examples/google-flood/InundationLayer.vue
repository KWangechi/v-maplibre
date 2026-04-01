<script setup lang="ts">
  import { VLayerDeckglPolygon } from '@geoql/v-maplibre';
  import type { GoogleFloodSeverity, ParsedFloodPolygon } from '~/types/flood';

  const props = defineProps<{
    polygons: ParsedFloodPolygon[];
  }>();

  const SEVERITY_FILL: Record<
    GoogleFloodSeverity,
    [number, number, number, number]
  > = {
    FLOOD_SEVERITY_UNSPECIFIED: [148, 163, 184, 40],
    UNKNOWN: [148, 163, 184, 40],
    NO_FLOODING: [34, 197, 94, 40],
    ABOVE_NORMAL: [234, 179, 8, 60],
    SEVERE: [249, 115, 22, 80],
    EXTREME: [220, 38, 38, 100],
  };

  const SEVERITY_LINE: Record<
    GoogleFloodSeverity,
    [number, number, number, number]
  > = {
    FLOOD_SEVERITY_UNSPECIFIED: [148, 163, 184, 180],
    UNKNOWN: [148, 163, 184, 180],
    NO_FLOODING: [34, 197, 94, 200],
    ABOVE_NORMAL: [234, 179, 8, 220],
    SEVERE: [249, 115, 22, 230],
    EXTREME: [220, 38, 38, 255],
  };

  const rawPolygons = computed(() => toRaw(props.polygons));

  function getPolygon(d: unknown): [number, number][][] {
    return (d as ParsedFloodPolygon).coordinates;
  }

  function getFillColor(d: unknown): [number, number, number, number] {
    const p = d as ParsedFloodPolygon;
    return SEVERITY_FILL[p.severity] ?? SEVERITY_FILL.UNKNOWN;
  }

  function getLineColor(d: unknown): [number, number, number, number] {
    const p = d as ParsedFloodPolygon;
    return SEVERITY_LINE[p.severity] ?? SEVERITY_LINE.UNKNOWN;
  }
</script>

<template>
  <VLayerDeckglPolygon
    v-if="rawPolygons.length > 0"
    id="flood-inundation"
    :data="rawPolygons"
    :get-polygon="getPolygon"
    :get-fill-color="getFillColor"
    :get-line-color="getLineColor"
    :line-width-min-pixels="1"
    :opacity="0.8"
    :stroked="true"
    :filled="true"
  />
</template>
