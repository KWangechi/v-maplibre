<script setup lang="ts">
  import type { BattlefieldStats } from '~/types/defense-terrain';

  defineProps<{
    stats: BattlefieldStats;
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
      <Icon name="lucide:target" class="size-3.5" />
      <span class="font-semibold text-foreground">{{ stats.phaseLabel }}</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:timer" class="size-3.5" />
      <span>{{ formatTime(stats.elapsedTime) }}</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:users" class="size-3.5" />
      <span>{{ stats.activeUnits }} units</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="max-w-48 truncate text-muted-foreground">
      {{ stats.phaseDescription }}
    </div>
  </div>
</template>
