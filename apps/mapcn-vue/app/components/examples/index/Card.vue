<script setup lang="ts">
  import type { Example } from '~/types/examples';

  withDefaults(
    defineProps<{
      example: Example;
      /** Bento tiles span 2×2 grid cells and use a taller preview. */
      size?: 'sm' | 'lg';
    }>(),
    { size: 'sm' },
  );
</script>

<template>
  <NuxtLink
    :to="example.href"
    :class="[
      'group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-foreground/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      size === 'lg' ? 'md:col-span-2 md:row-span-2' : '',
    ]"
  >
    <div
      :class="[
        'relative w-full',
        size === 'lg'
          ? 'aspect-16/10 md:aspect-auto md:flex-1'
          : 'aspect-16/10',
      ]"
    >
      <ExamplesIndexPreview :href="example.href" :icon="example.icon" />
      <div
        v-if="example.badge"
        class="absolute top-3 right-3 rounded-sm border border-border bg-background/80 px-2 py-0.5 font-mono text-2xs tracking-caps-xs text-muted-foreground uppercase backdrop-blur-sm"
      >
        {{ example.badge }}
      </div>
    </div>

    <div class="border-t border-border px-4 py-3">
      <div class="flex items-center gap-2">
        <Icon :name="example.icon" class="size-3.5 shrink-0 text-primary" />
        <h3
          :class="[
            'truncate font-medium tracking-tight text-foreground',
            size === 'lg' ? 'text-base md:text-lg' : 'text-sm',
          ]"
        >
          {{ example.title }}
        </h3>
        <Icon
          name="lucide:arrow-right"
          class="ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </div>
      <p class="mt-1 line-clamp-2 text-xs/relaxed text-muted-foreground">
        {{ example.description }}
      </p>
    </div>
  </NuxtLink>
</template>
