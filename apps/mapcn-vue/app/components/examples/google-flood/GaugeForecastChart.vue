<script setup lang="ts">
  import type { GoogleFloodSeverity, GoogleGaugeForecast } from '~/types/flood';

  const props = defineProps<{
    forecast: GoogleGaugeForecast | undefined;
    loading: boolean;
  }>();

  const SEVERITY_BAR_COLORS: Record<GoogleFloodSeverity, string> = {
    FLOOD_SEVERITY_UNSPECIFIED: '#64748b',
    UNKNOWN: '#94a3b8',
    NO_FLOODING: '#22c55e',
    ABOVE_NORMAL: '#eab308',
    SEVERE: '#f97316',
    EXTREME: '#dc2626',
  };

  const intervals = computed(() => {
    if (!props.forecast?.forecastSummary?.forecastTimeIntervalSummaries)
      return [];
    return props.forecast.forecastSummary.forecastTimeIntervalSummaries.map(
      (s) => ({
        severity: s.severity,
        color: SEVERITY_BAR_COLORS[s.severity] ?? '#94a3b8',
        label: new Date(s.forecastInterval.startTime).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        }),
      }),
    );
  });

  const overallSeverity = computed(
    () => props.forecast?.forecastSummary?.severity ?? 'UNKNOWN',
  );
</script>

<template>
  <div class="px-3 py-2.5">
    <p
      class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      Gauge Forecast
    </p>

    <div v-if="loading" class="space-y-2">
      <div class="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div class="flex gap-1">
        <div
          v-for="i in 6"
          :key="i"
          class="h-8 flex-1 animate-pulse rounded bg-muted"
        />
      </div>
    </div>

    <div
      v-else-if="!forecast"
      class="py-3 text-center text-xs text-muted-foreground"
    >
      <Icon
        name="lucide:bar-chart-2"
        class="mb-1 size-6 text-muted-foreground/40"
      />
      <p>Select a gauge to view forecast</p>
    </div>

    <template v-else>
      <div class="mb-2 flex items-center gap-2">
        <span class="text-xs text-muted-foreground">Overall:</span>
        <ExamplesGoogleFloodSeverityBadge
          :severity="overallSeverity"
          size="sm"
        />
      </div>

      <div v-if="intervals.length" class="flex items-end gap-0.5">
        <div
          v-for="(interval, i) in intervals"
          :key="i"
          class="group relative flex flex-1 flex-col items-center"
        >
          <div
            class="w-full rounded-t-sm transition-opacity hover:opacity-80"
            :style="{ backgroundColor: interval.color, height: '28px' }"
          />
          <span class="mt-1 text-[8px] text-muted-foreground">{{
            interval.label
          }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
