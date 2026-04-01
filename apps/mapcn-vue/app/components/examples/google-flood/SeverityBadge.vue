<script setup lang="ts">
  import type { GoogleFloodSeverity } from '~/types/flood';

  const props = withDefaults(
    defineProps<{
      severity: GoogleFloodSeverity;
      size?: 'sm' | 'md';
    }>(),
    { size: 'sm' },
  );

  const LABELS: Record<GoogleFloodSeverity, string> = {
    FLOOD_SEVERITY_UNSPECIFIED: 'Unknown',
    UNKNOWN: 'Unknown',
    NO_FLOODING: 'No Flooding',
    ABOVE_NORMAL: 'Above Normal',
    SEVERE: 'Severe',
    EXTREME: 'Extreme',
  };

  const ICONS: Record<GoogleFloodSeverity, string> = {
    FLOOD_SEVERITY_UNSPECIFIED: 'lucide:help-circle',
    UNKNOWN: 'lucide:help-circle',
    NO_FLOODING: 'lucide:check-circle',
    ABOVE_NORMAL: 'lucide:alert-circle',
    SEVERE: 'lucide:alert-triangle',
    EXTREME: 'lucide:waves',
  };

  const COLOR_CLASSES: Record<GoogleFloodSeverity, string> = {
    FLOOD_SEVERITY_UNSPECIFIED:
      'bg-slate-500/15 text-slate-400 border-slate-500/30',
    UNKNOWN: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    NO_FLOODING: 'bg-green-500/15 text-green-500 border-green-500/30',
    ABOVE_NORMAL: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
    SEVERE: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
    EXTREME: 'bg-red-600/15 text-red-500 border-red-500/30',
  };

  const label = computed(() => LABELS[props.severity] ?? 'Unknown');
  const icon = computed(() => ICONS[props.severity] ?? 'lucide:help-circle');
  const colorClass = computed(
    () => COLOR_CLASSES[props.severity] ?? COLOR_CLASSES.UNKNOWN,
  );
  const sizeClass = computed(() =>
    props.size === 'md'
      ? 'px-2.5 py-1 text-xs gap-1.5'
      : 'px-1.5 py-0.5 text-[10px] gap-1',
  );
  const iconSize = computed(() =>
    props.size === 'md' ? 'size-3.5' : 'size-3',
  );
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border font-medium"
    :class="[colorClass, sizeClass]"
  >
    <Icon :name="icon" :class="iconSize" />
    {{ label }}
  </span>
</template>
