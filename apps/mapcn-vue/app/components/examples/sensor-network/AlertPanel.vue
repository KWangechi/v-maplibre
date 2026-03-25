<script setup lang="ts">
  import type { ThreatEvent } from '~/types/defense-sensor';

  defineProps<{
    threats: ThreatEvent[];
  }>();

  function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  }

  function levelDot(level: ThreatEvent['level']): string {
    if (level === 'critical') return 'bg-red-500';
    if (level === 'high') return 'bg-orange-500';
    if (level === 'medium') return 'bg-amber-500';
    return 'bg-yellow-400';
  }

  function levelText(level: ThreatEvent['level']): string {
    if (level === 'critical') return 'text-red-600 dark:text-red-400';
    if (level === 'high') return 'text-orange-600 dark:text-orange-400';
    if (level === 'medium') return 'text-amber-600 dark:text-amber-400';
    return 'text-yellow-600 dark:text-yellow-300';
  }
</script>

<template>
  <div
    v-if="threats.length > 0"
    class="overflow-hidden border-t border-border/30 bg-background/90 py-1 font-mono text-xs backdrop-blur-sm"
  >
    <div class="flex animate-marquee items-center gap-6 whitespace-nowrap">
      <template v-for="threat in threats" :key="threat.id">
        <span class="flex items-center gap-1.5">
          <span
            class="inline-block size-1.5 animate-pulse rounded-full"
            :class="levelDot(threat.level)"
          />
          <span class="font-bold uppercase" :class="levelText(threat.level)">
            [{{ threat.level }}]
          </span>
          <span class="text-foreground">{{ threat.description }}</span>
          <span class="text-muted-foreground"
            >&mdash; {{ timeAgo(threat.timestamp) }}</span
          >
        </span>
      </template>
      <!-- Duplicate for seamless loop -->
      <template v-for="threat in threats" :key="`dup-${threat.id}`">
        <span class="flex items-center gap-1.5">
          <span
            class="inline-block size-1.5 animate-pulse rounded-full"
            :class="levelDot(threat.level)"
          />
          <span class="font-bold uppercase" :class="levelText(threat.level)">
            [{{ threat.level }}]
          </span>
          <span class="text-foreground">{{ threat.description }}</span>
          <span class="text-muted-foreground"
            >&mdash; {{ timeAgo(threat.timestamp) }}</span
          >
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .animate-marquee {
    animation: marquee 30s linear infinite;
  }
</style>
