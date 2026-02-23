<script setup lang="ts">
  defineProps<{
    isPlaying: boolean;
    speed: number;
    progress: number;
    hasFlightPath: boolean;
  }>();

  const emit = defineEmits<{
    play: [];
    pause: [];
    reset: [];
    setSpeed: [speed: number];
    uploadFile: [file: File];
  }>();

  const fileInputRef = ref<HTMLInputElement | null>(null);
  const speedOptions = [0.5, 1, 2, 4];

  function handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      emit('uploadFile', file);
      input.value = '';
    }
  }

  function triggerUpload(): void {
    fileInputRef.value?.click();
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- Upload -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Flight Path</h3>
      <button
        class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/50 px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        @click="triggerUpload"
      >
        <Icon name="lucide:upload" class="size-4" />
        <span>Upload GeoJSON</span>
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept=".geojson,.json"
        class="hidden"
        @change="handleFileChange"
      />
      <p class="text-xs text-muted-foreground">
        LineString GeoJSON with flight coordinates
      </p>
    </div>

    <!-- Playback -->
    <div v-if="hasFlightPath" class="space-y-3">
      <h3 class="text-sm font-semibold">Playback</h3>

      <!-- Progress bar -->
      <div class="space-y-1">
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary transition-all"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="text-right text-xs text-muted-foreground">
          {{ Math.round(progress) }}%
        </p>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-center gap-2">
        <button
          class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Reset"
          @click="emit('reset')"
        >
          <Icon name="lucide:rotate-ccw" class="size-4" />
        </button>
        <button
          class="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          :title="isPlaying ? 'Pause' : 'Play'"
          @click="isPlaying ? emit('pause') : emit('play')"
        >
          <Icon
            :name="isPlaying ? 'lucide:pause' : 'lucide:play'"
            class="size-4"
          />
        </button>
      </div>

      <!-- Speed -->
      <div class="space-y-1">
        <h4 class="text-xs font-medium text-muted-foreground">Speed</h4>
        <div class="flex gap-1">
          <button
            v-for="s in speedOptions"
            :key="s"
            class="flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
            :class="
              speed === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            "
            @click="emit('setSpeed', s)"
          >
            {{ s }}x
          </button>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Sample path:</strong> Manhattan scenic flight is loaded by
        default. Upload your own GeoJSON LineString for a custom route.
      </p>
    </div>
  </div>
</template>
