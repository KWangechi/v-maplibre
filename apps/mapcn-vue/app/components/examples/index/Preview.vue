<script setup lang="ts">
  import { useElementSize, useElementVisibility } from '@vueuse/core';
  import type { ExamplePreviewProps } from '~/types/examples';

  const props = defineProps<ExamplePreviewProps>();

  // The real example renders on a 600px-tall stage scaled to the card's
  // height. The stage width follows the card's aspect ratio, so the map
  // fills the card and overlay panels pinned to an edge stay in view
  // (a fixed 16:10 stage scaled to cover would crop them).
  const STAGE_HEIGHT = 600;

  const frame = useTemplateRef<HTMLElement>('frame');
  const visible = useElementVisibility(frame);
  const { width, height } = useElementSize(frame);
  const isLive = useLivePreview(props.href, visible);
  const page = useExamplePage(props.href);
  const scale = computed(() => (height.value || STAGE_HEIGHT) / STAGE_HEIGHT);
  const stageWidth = computed(() =>
    width.value ? width.value / scale.value : STAGE_HEIGHT * 1.6,
  );

  // ComponentDemo renders only the map, and usePageGeo skips the page's
  // head tags, so a preview never rewrites the gallery's <head>.
  provide(GALLERY_PREVIEW_KEY, true);
</script>

<template>
  <div
    ref="frame"
    class="relative size-full overflow-hidden bg-muted/30 dark:bg-background"
  >
    <!-- Shown until this preview gets a live slot, and on the server. -->
    <div
      v-if="!isLive"
      class="absolute inset-0 grid place-items-center"
      aria-hidden="true"
    >
      <Icon :name="icon" class="size-8 text-muted-foreground/30" />
    </div>
    <ClientOnly>
      <div
        v-if="isLive && page"
        class="pointer-events-none absolute top-0 left-0 h-150 origin-top-left"
        :style="{
          width: `${stageWidth}px`,
          transform: `scale(${scale})`,
        }"
        aria-hidden="true"
        inert
      >
        <component :is="page" />
      </div>
    </ClientOnly>
  </div>
</template>
