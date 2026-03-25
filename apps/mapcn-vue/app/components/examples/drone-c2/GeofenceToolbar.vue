<script setup lang="ts">
  import type { GeofenceDrawMode } from '~/types/defense-drone-c2';

  defineProps<{
    drawMode: GeofenceDrawMode;
    breachCount: number;
  }>();

  const emit = defineEmits<{
    setMode: [mode: GeofenceDrawMode];
    clear: [];
  }>();

  function handleSetPolygon(): void {
    emit('setMode', 'polygon');
  }

  function handleSetSelect(): void {
    emit('setMode', 'select');
  }

  function handleClear(): void {
    emit('clear');
  }
</script>

<template>
  <div class="flex flex-col items-end gap-2">
    <div
      class="flex items-center gap-1 rounded-lg border border-border/50 bg-background/95 p-1 shadow-sm backdrop-blur-sm"
    >
      <button
        class="flex size-8 items-center justify-center rounded-md transition-colors"
        :class="
          drawMode === 'polygon'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent'
        "
        title="Draw geofence"
        @click="handleSetPolygon"
      >
        <Icon name="lucide:pentagon" class="size-4" />
      </button>
      <button
        class="flex size-8 items-center justify-center rounded-md transition-colors"
        :class="
          drawMode === 'select'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent'
        "
        title="Select & edit"
        @click="handleSetSelect"
      >
        <Icon name="lucide:mouse-pointer-2" class="size-4" />
      </button>
      <button
        class="flex size-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
        title="Clear geofence"
        @click="handleClear"
      >
        <Icon name="lucide:trash-2" class="size-4" />
      </button>
    </div>
    <div
      v-if="breachCount > 0"
      class="flex items-center gap-1.5 rounded-lg border border-destructive/50 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive backdrop-blur-sm"
    >
      <Icon name="lucide:shield-alert" class="size-3.5" />
      <span>{{ breachCount }} breach{{ breachCount > 1 ? 'es' : '' }}</span>
    </div>
  </div>
</template>
