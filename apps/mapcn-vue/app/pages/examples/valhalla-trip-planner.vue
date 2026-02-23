<script setup lang="ts">
  useSeoMeta({
    title: 'Trip Planner - mapcn-vue Examples',
    description:
      'Multi-day itinerary generator with POI suggestions using Valhalla routing.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Trip Planner',
    description:
      'Multi-day itinerary generator with POI suggestions using Valhalla routing.',
    category: 'Valhalla',
  });
</script>

<template>
  <ComponentDemo
    title="Trip Planner"
    description="Multi-day itinerary generator with POI suggestions using Valhalla routing."
    registry="map-layers"
    full-width
    class="h-full"
  >
    <ExamplesRouteTripPlannerTab />
  </ComponentDemo>
</template>
