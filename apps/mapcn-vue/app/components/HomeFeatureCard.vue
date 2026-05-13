<script setup lang="ts">
  defineProps<{
    icon: string;
    title: string;
    description: string;
  }>();
</script>

<template>
  <div
    class="group flex flex-col rounded-md border border-border bg-card p-6 transition-colors hover:bg-muted/40"
  >
    <Icon
      :name="icon"
      class="size-5 text-primary transition-transform group-hover:scale-110"
    />
    <h3 class="mt-5 text-base font-medium tracking-tight text-foreground">
      {{ title }}
    </h3>
    <p class="mt-2 text-sm/relaxed text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>
