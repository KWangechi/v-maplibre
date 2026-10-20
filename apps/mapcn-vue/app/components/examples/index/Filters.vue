<script setup lang="ts">
  defineProps<{
    chips: { id: string; title: string; count: number }[];
    matchCount: number;
  }>();

  const query = defineModel<string>('query', { required: true });
  const active = defineModel<string>('active', { required: true });
</script>

<template>
  <div
    class="sticky top-0 z-10 -mx-4 mb-10 space-y-3 border-b border-border bg-background/85 px-4 py-4 backdrop-blur-md"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-center">
      <div class="relative md:w-80">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="query"
          type="search"
          placeholder="Filter examples…"
          aria-label="Filter examples"
          class="pl-8"
        />
      </div>
      <p
        class="font-mono text-caption tracking-caps-sm text-muted-foreground uppercase tabular-nums"
        aria-live="polite"
      >
        {{ matchCount }} shown
      </p>
    </div>

    <div
      role="group"
      aria-label="Example categories"
      class="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1"
    >
      <button
        v-for="chip in chips"
        :key="chip.id"
        type="button"
        :aria-pressed="active === chip.id"
        :class="[
          'inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring',
          active === chip.id
            ? 'border-foreground bg-foreground text-background'
            : 'border-border text-muted-foreground hover:text-foreground',
        ]"
        @click="active = chip.id"
      >
        {{ chip.title }}
        <span class="font-mono text-2xs tabular-nums opacity-60">
          {{ chip.count }}
        </span>
      </button>
    </div>
  </div>
</template>
