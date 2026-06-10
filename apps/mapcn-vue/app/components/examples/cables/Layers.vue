<script setup lang="ts">
  import type {
    CableSegment,
    EezZone,
    LandingPoint,
  } from '~/types/maritime-cables';
  import type { Position, Color } from '@deck.gl/core';
  import {
    VLayerDeckglPolygon,
    VLayerDeckglPath,
    VLayerDeckglScatterplot,
    VLayerDeckglText,
  } from '@geoql/v-maplibre/deck.gl';

  defineProps<{
    filteredSegments: CableSegment[];
    landingPoints: LandingPoint[];
    eezZones: EezZone[];
    showEez: boolean;
  }>();

  function getSegmentColor(d: unknown): Color {
    const seg = d as CableSegment;
    if (seg.riskScore >= 70) return [255, 30, 30, 230];
    if (seg.riskScore >= 40) return [255, 180, 60, 230];
    return [0, 200, 100, 230];
  }

  function getEezPolygon(d: unknown): Position[] {
    return (d as EezZone).polygon;
  }

  function getSegmentPath(d: unknown): Position[] {
    return (d as CableSegment).path;
  }

  function getLandingPosition(d: unknown): Position {
    return (d as LandingPoint).position;
  }

  function getLandingText(d: unknown): string {
    return (d as LandingPoint).name;
  }
</script>

<template>
  <VLayerDeckglPolygon
    v-if="showEez"
    id="cables-eez"
    :data="eezZones"
    :get-polygon="getEezPolygon"
    :get-fill-color="[0, 90, 200, 55]"
    :get-line-color="[0, 170, 255, 170]"
    :line-width-min-pixels="1.5"
  />

  <VLayerDeckglPath
    id="cables-segments"
    :data="filteredSegments"
    :get-path="getSegmentPath"
    :get-color="getSegmentColor"
    :get-width="4"
    width-units="pixels"
    :width-min-pixels="3.5"
    :width-max-pixels="8"
    :cap-rounded="true"
    :joint-rounded="true"
  />

  <VLayerDeckglScatterplot
    id="cables-landing"
    :data="landingPoints"
    :get-position="getLandingPosition"
    :get-fill-color="[80, 220, 180, 240]"
    :get-radius="5"
    radius-units="pixels"
    :stroked="true"
    :get-line-color="[255, 255, 255, 200]"
    :line-width-min-pixels="2"
  />

  <VLayerDeckglText
    id="cables-landing-labels"
    :data="landingPoints"
    :get-position="getLandingPosition"
    :get-text="getLandingText"
    :get-color="[230, 240, 255, 220]"
    :get-size="11"
    :get-pixel-offset="[0, -14]"
    font-family="monospace"
    :font-weight="600"
    :outline-width="3"
    :outline-color="[0, 0, 0, 200]"
    :billboard="true"
  />
</template>
