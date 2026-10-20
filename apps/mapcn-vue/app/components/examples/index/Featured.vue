<script setup lang="ts">
  import type { Example } from '~/types/examples';

  defineProps<{ examples: Example[] }>();

  // 3-column bento: a 2×2 anchor tile beside two stacked tiles, then mirrored.
  const LARGE = new Set([0, 4]);
</script>

<template>
  <section aria-labelledby="featured-heading" class="mb-16">
    <h2
      id="featured-heading"
      class="mb-4 font-mono text-caption font-medium tracking-caps text-muted-foreground uppercase"
    >
      Featured
    </h2>
    <div class="grid gap-4 md:grid-cols-3 md:grid-flow-dense">
      <ExamplesIndexCard
        v-for="(example, i) in examples"
        :key="example.href"
        :example="example"
        :size="LARGE.has(i) ? 'lg' : 'sm'"
      />
    </div>
  </section>
</template>
