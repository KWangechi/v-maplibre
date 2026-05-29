<script setup lang="ts">
  import type {
    VesselPosition,
    StsEventDatum,
    LanePathDatum,
  } from '~/types/maritime-chokepoints';
  import type { Position, Color } from '@deck.gl/core';
  import {
    VLayerDeckglHexagon,
    VLayerDeckglPath,
    VLayerDeckglScatterplot,
    VLayerDeckglText,
  } from '@geoql/v-maplibre';

  const props = defineProps<{
    vesselPositions: VesselPosition[];
    stsEventData: StsEventDatum[];
    lanePath: LanePathDatum;
    loopedTime: number;
    hexagonRadius: number;
    elevationScale: number;
    showSts: boolean;
  }>();

  const COLOR_RANGE: Color[] = [
    [30, 100, 220],
    [60, 140, 230],
    [100, 170, 220],
    [200, 200, 80],
    [240, 160, 40],
    [220, 80, 30],
    [180, 30, 20],
  ];

  const lane = computed(() => [props.lanePath]);

  const pulse = computed(
    () => 0.5 + 0.5 * Math.sin((props.loopedTime / 120) * 2 * Math.PI),
  );

  const getStsColor = computed(() => {
    const alpha = Math.round(120 + 120 * pulse.value);
    return (d: unknown): Color =>
      (d as StsEventDatum).risk > 65
        ? [220, 50, 30, alpha]
        : [240, 180, 40, alpha];
  });

  const getStsLineColor = computed(() => {
    const alpha = Math.round(180 + 77 * pulse.value);
    return (d: unknown): Color =>
      (d as StsEventDatum).risk > 65
        ? [255, 80, 50, alpha]
        : [255, 200, 80, alpha];
  });

  function getVesselPosition(d: unknown): Position {
    const v = d as VesselPosition;
    return [v.lng, v.lat];
  }

  function getStsPosition(d: unknown): Position {
    const v = d as StsEventDatum;
    return [v.lng, v.lat];
  }

  function getLanePath(d: unknown): Position[] {
    return (d as LanePathDatum).path;
  }

  function getStsText(d: unknown): string {
    return `${(d as StsEventDatum).risk}%`;
  }

  function getStsLabelPosition(d: unknown): Position {
    const v = d as StsEventDatum;
    return [v.lng, v.lat + 0.05];
  }
</script>

<template>
  <VLayerDeckglHexagon
    id="chokepoints-hex"
    :data="vesselPositions"
    :get-position="getVesselPosition"
    :extruded="true"
    :radius="hexagonRadius"
    :elevation-scale="elevationScale"
    :elevation-range="[0, 3000]"
    :color-range="COLOR_RANGE"
    :coverage="0.88"
    :opacity="0.85"
  />

  <VLayerDeckglPath
    id="chokepoints-lane"
    :data="lane"
    :get-path="getLanePath"
    :get-color="[0, 160, 255, 140]"
    :width-min-pixels="3"
  />

  <VLayerDeckglScatterplot
    v-if="showSts"
    id="chokepoints-sts-ring"
    :data="stsEventData"
    :get-position="getStsPosition"
    :get-radius="1200"
    :get-fill-color="getStsColor"
    :get-line-color="getStsLineColor"
    :line-width-min-pixels="2"
    :stroked="true"
    :filled="true"
    radius-units="meters"
    :opacity="0.9"
  />

  <VLayerDeckglText
    v-if="showSts"
    id="chokepoints-sts-label"
    :data="stsEventData"
    :get-position="getStsLabelPosition"
    :get-text="getStsText"
    :get-color="[255, 200, 80, 220]"
    :get-size="13"
    font-family="monospace"
    :font-weight="700"
    :outline-width="2"
    :outline-color="[0, 0, 0, 180]"
    :billboard="true"
  />
</template>
