<script setup lang="ts">
  import { FLOOD_REGIONS } from '~/composables/use-google-flood';
  import type { FloodRegion } from '~/types/flood';

  const props = defineProps<{
    modelValue: string;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: string];
  }>();

  const selected = computed<FloodRegion>(
    () =>
      FLOOD_REGIONS.find((r) => r.code === props.modelValue) ??
      FLOOD_REGIONS[0]!,
  );

  function handleSelect(code: string): void {
    emit('update:modelValue', code);
  }

  const open = ref(false);

  function toggleOpen(): void {
    open.value = !open.value;
  }

  function selectAndClose(code: string): void {
    handleSelect(code);
    open.value = false;
  }
</script>

<template>
  <div class="relative px-4 py-3">
    <p
      class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      Region
    </p>
    <button
      class="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
      @click="toggleOpen"
    >
      <span class="flex items-center gap-2 font-medium text-foreground">
        <Icon name="lucide:map-pin" class="size-3.5 text-primary" />
        {{ selected?.name }}
      </span>
      <Icon
        name="lucide:chevron-down"
        class="size-3.5 text-muted-foreground transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <div
        v-if="open"
        class="absolute left-4 right-4 top-full z-20 mt-1 max-h-56 overflow-auto rounded-lg border border-border bg-popover shadow-xl"
      >
        <button
          v-for="region in FLOOD_REGIONS"
          :key="region.code"
          class="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent"
          :class="{
            'text-primary font-medium': region.code === modelValue,
            'text-foreground': region.code !== modelValue,
          }"
          @click="selectAndClose(region.code)"
        >
          <span class="font-mono text-[10px] text-muted-foreground">{{
            region.code
          }}</span>
          {{ region.name }}
          <Icon
            v-if="region.code === modelValue"
            name="lucide:check"
            class="ml-auto size-3 text-primary"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>
