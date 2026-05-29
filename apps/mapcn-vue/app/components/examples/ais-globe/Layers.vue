<script setup lang="ts">
  import type {
    Vessel,
    VesselPosition,
    VesselPositionDatum,
    VesselLabelDatum,
    TripDatum,
  } from '~/types/maritime-ais';
  import type { Position, Color } from '@deck.gl/core';
  import {
    VLayerDeckglTrips,
    VLayerDeckglScatterplot,
    VLayerDeckglText,
  } from '@geoql/v-maplibre';

  const props = defineProps<{
    vessels: Vessel[];
    positions: Record<string, VesselPosition>;
    tripData: TripDatum[];
    loopedTime: number;
  }>();

  const RADIUS_BY_TYPE: Record<string, number> = {
    cargo: 8,
    tanker: 9,
    fishing: 6,
    naval: 7,
    passenger: 8,
  };

  const colorById = computed(() => {
    const m = new Map<string, [number, number, number]>();
    for (const v of props.vessels) m.set(v.id, v.color);
    return m;
  });

  function toDatum(v: Vessel): VesselPositionDatum | null {
    const pos = props.positions[v.id];
    if (!pos) return null;
    return {
      lng: pos.lng,
      lat: pos.lat,
      vesselId: v.id,
      type: v.type,
      dark: v.dark,
    };
  }

  const positionData = computed(() =>
    props.vessels
      .filter((v) => !v.dark)
      .map(toDatum)
      .filter((d): d is VesselPositionDatum => d !== null),
  );

  const darkData = computed(() =>
    props.vessels
      .filter((v) => v.dark)
      .map(toDatum)
      .filter((d): d is VesselPositionDatum => d !== null),
  );

  const labelData = computed<VesselLabelDatum[]>(() =>
    props.vessels
      .filter((v) => v.dark || v.type === 'naval')
      .map((v) => {
        const pos = props.positions[v.id];
        return pos
          ? { position: [pos.lng, pos.lat] as Position, text: v.mmsi }
          : null;
      })
      .filter((d): d is VesselLabelDatum => d !== null),
  );

  const getDarkRadius = computed(() => {
    const r = 14 + 6 * Math.sin(props.loopedTime * 0.4);
    return (): number => r;
  });

  const getDarkLineColor = computed(() => {
    const alpha = Math.round(120 + 80 * Math.sin(props.loopedTime * 0.4));
    return (): Color => [255, 30, 30, alpha];
  });

  function getTripPath(d: unknown): Position[] {
    return (d as TripDatum).path;
  }

  function getTripTimestamps(d: unknown): number[] {
    return (d as TripDatum).timestamps;
  }

  function getTripColor(d: unknown): Color {
    return colorById.value.get((d as TripDatum).vesselId) ?? [200, 200, 200];
  }

  function getVesselPosition(d: unknown): Position {
    const datum = d as VesselPositionDatum;
    return [datum.lng, datum.lat];
  }

  function getVesselFillColor(d: unknown): Color {
    const c = colorById.value.get((d as VesselPositionDatum).vesselId) ?? [
      200, 200, 200,
    ];
    return [c[0], c[1], c[2], 220];
  }

  function getVesselRadius(d: unknown): number {
    return RADIUS_BY_TYPE[(d as VesselPositionDatum).type] ?? 7;
  }

  function getLabelPosition(d: unknown): Position {
    return (d as VesselLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as VesselLabelDatum).text;
  }
</script>

<template>
  <VLayerDeckglTrips
    id="ais-trails"
    :data="tripData"
    :get-path="getTripPath"
    :get-timestamps="getTripTimestamps"
    :get-color="getTripColor"
    :current-time="loopedTime"
    :trail-length="35"
    :fade-trail="true"
    :width-min-pixels="2"
    :cap-rounded="true"
    :joint-rounded="true"
    :opacity="0.5"
  />

  <VLayerDeckglScatterplot
    id="ais-positions"
    :data="positionData"
    :get-position="getVesselPosition"
    :get-fill-color="getVesselFillColor"
    :get-radius="getVesselRadius"
    radius-units="pixels"
    :stroked="true"
    :get-line-color="[255, 255, 255, 160]"
    :line-width-min-pixels="1.5"
  />

  <VLayerDeckglScatterplot
    id="ais-dark-positions"
    :data="darkData"
    :get-position="getVesselPosition"
    :get-fill-color="[60, 10, 10, 220]"
    :get-radius="7"
    radius-units="pixels"
    :stroked="true"
    :get-line-color="[255, 50, 50, 200]"
    :line-width-min-pixels="2"
  />

  <VLayerDeckglScatterplot
    id="ais-dark-pulse"
    :data="darkData"
    :get-position="getVesselPosition"
    :get-fill-color="[255, 30, 30, 0]"
    :get-radius="getDarkRadius"
    radius-units="pixels"
    :stroked="true"
    :get-line-color="getDarkLineColor"
    :line-width-min-pixels="2"
    :pickable="false"
  />

  <VLayerDeckglText
    id="ais-labels"
    :data="labelData"
    :get-position="getLabelPosition"
    :get-text="getLabelText"
    :get-color="[255, 255, 255, 220]"
    :get-size="10"
    :get-pixel-offset="[0, -20]"
    font-family="monospace"
    :font-weight="700"
    :outline-width="3"
    :outline-color="[0, 0, 0, 200]"
    :billboard="true"
  />
</template>
