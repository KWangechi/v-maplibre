<script setup lang="ts">
  defineProps<{
    icon: string;
    title: string;
    description: string;
  }>();
</script>

<template>
  <div
    class="rounded-xl border border-border/50 bg-muted/20 p-5 transition-colors hover:border-primary/30 hover:bg-muted/40"
  >
    <div
      class="flex size-10 items-center justify-center rounded-lg border border-border/50 bg-background"
    >
      <Icon :name="icon" class="size-5 text-primary" />
    </div>
    <h3 class="mt-3 text-base font-semibold">{{ title }}</h3>
    <p class="mt-1.5 text-sm/relaxed text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>
