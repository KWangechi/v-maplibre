<script setup lang="ts">
  useSeoMeta({
    title: 'Route Planning - mapcn-vue Examples',
    description:
      'A to B routing with turn-by-turn directions using Valhalla routing API.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Route Planning',
    description:
      'A to B routing with turn-by-turn directions using Valhalla routing API.',
    category: 'Valhalla',
  });
</script>

<template>
  <ComponentDemo
    title="Route Planning"
    description="A to B routing with turn-by-turn directions using Valhalla routing API."
    registry="map-layers"
    full-width
    class="h-full"
  >
    <ExamplesRoutePlanningTab />
  </ComponentDemo>
</template>
