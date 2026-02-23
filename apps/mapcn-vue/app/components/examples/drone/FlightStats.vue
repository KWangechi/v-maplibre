<script setup lang="ts">
  import type { DroneFlightStats } from '~/types/drone';

  defineProps<{
    stats: DroneFlightStats;
  }>();

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-lg border border-border/50 bg-background/90 px-3 py-2 text-xs backdrop-blur-sm"
  >
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:route" class="size-3.5" />
      <span>{{ stats.totalDistance.toFixed(1) }} km</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:gauge" class="size-3.5" />
      <span>{{ stats.currentSpeed }} km/h</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:mountain" class="size-3.5" />
      <span>{{ stats.altitude }}m</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:timer" class="size-3.5" />
      <span>{{ formatTime(stats.elapsedTime) }}</span>
    </div>
  </div>
</template>
