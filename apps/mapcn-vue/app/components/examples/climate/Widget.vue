<script setup lang="ts">
  import type {
    ClassContext,
    KoppenClassId,
    TreemapCell,
  } from '~/types/climate';
  import {
    KOPPEN_CLASSES,
    pickTextColor,
    formatPct,
  } from '~/composables/use-koppen-classes';

  defineProps<{
    countryName: string;
    treemapCells: TreemapCell[];
    detailView: { klass: KoppenClassId } | null;
    detailContext: ClassContext | null;
    containerW: number;
    containerH: number;
  }>();

  const emit = defineEmits<{
    openDetail: [klass: KoppenClassId];
    closeDetail: [];
    shuffleOne: [klass: KoppenClassId];
    hoverKlass: [klass: KoppenClassId | null];
  }>();

  function handleCellClick(klass: KoppenClassId): void {
    emit('openDetail', klass);
  }

  function handleBack(): void {
    emit('closeDetail');
  }

  function handleCellEnter(klass: KoppenClassId): void {
    emit('hoverKlass', klass);
  }

  function handleCellLeave(): void {
    emit('hoverKlass', null);
  }

  function handleShuffleDetail(klass: KoppenClassId): void {
    emit('shuffleOne', klass);
  }
</script>

<template>
  <div>
    <!-- Detail view -->
    <template v-if="detailView && detailContext">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer px-1 py-0.5 mb-2"
        @click="handleBack"
      >
        <Icon name="lucide:arrow-left" class="size-3" />
        Back to grid
      </button>

      <div class="flex items-center gap-2.5 py-1.5">
        <span
          class="size-7 rounded shrink-0 border border-border/30"
          :style="{ background: KOPPEN_CLASSES[detailView.klass]?.color }"
        />
        <div class="text-sm">
          <div class="font-mono font-bold tracking-tight">
            {{ KOPPEN_CLASSES[detailView.klass]?.symbol }}
          </div>
          <div class="text-muted-foreground text-xs">
            {{ KOPPEN_CLASSES[detailView.klass]?.name }}
          </div>
        </div>
      </div>

      <div class="text-xs text-muted-foreground mt-2 mb-2">
        {{ formatPct(detailContext.fraction) }}% of {{ countryName }}
      </div>

      <div
        class="flex items-center gap-2.5 text-sm px-2.5 py-2 bg-muted/50 rounded-md"
      >
        <button
          type="button"
          class="flex items-center justify-center size-8 rounded-md border border-border bg-background hover:bg-muted cursor-pointer text-lg leading-none shrink-0"
          :aria-label="`Show a new match for ${KOPPEN_CLASSES[detailView.klass]?.symbol}`"
          @click="handleShuffleDetail(detailView.klass)"
        >
          ↺
        </button>
        <span>
          Climate of <b>{{ detailContext.exemplar.name }}</b>
        </span>
      </div>

      <div
        v-if="detailContext.runnersUp.length"
        class="text-xs text-muted-foreground mt-2"
      >
        Also:
        {{ detailContext.runnersUp.map((e) => e.name).join(', ') }}
      </div>
    </template>

    <!-- Treemap grid -->
    <template v-else>
      <div
        v-if="!treemapCells.length"
        class="py-3.5 text-xs text-muted-foreground text-center"
      >
        No climate data.
      </div>
      <div
        v-else
        class="relative"
        :style="{ width: containerW + 'px', height: containerH + 'px' }"
      >
        <button
          v-for="cell in treemapCells"
          :key="cell.klass"
          type="button"
          class="absolute flex flex-col justify-between gap-0.5 overflow-hidden p-1 rounded-sm border border-black/10 cursor-pointer transition-transform hover:z-10 hover:shadow-[inset_0_0_0_2px_rgba(0,0,0,0.5)] leading-tight"
          :class="cell.tiny ? 'items-center justify-center p-0' : ''"
          :style="{
            left: cell.x + 'px',
            top: cell.y + 'px',
            width: Math.max(0, cell.w - 2) + 'px',
            height: Math.max(0, cell.h - 2) + 'px',
            background: KOPPEN_CLASSES[cell.klass]?.color ?? '#ccc',
            color: pickTextColor(
              KOPPEN_CLASSES[cell.klass]?.color ?? 'rgb(200,200,200)',
            ),
          }"
          :title="`${KOPPEN_CLASSES[cell.klass]?.symbol} · ${KOPPEN_CLASSES[cell.klass]?.name} · ${formatPct(cell.fraction)}%`"
          @click="handleCellClick(cell.klass)"
          @mouseenter="handleCellEnter(cell.klass)"
          @mouseleave="handleCellLeave"
        >
          <span
            class="block w-full truncate font-mono font-bold leading-none"
            :class="cell.tiny ? 'text-center text-[9px]' : 'text-[13px]'"
          >
            {{ KOPPEN_CLASSES[cell.klass]?.symbol }}
          </span>
          <span
            v-if="!cell.tiny"
            class="block w-full truncate text-right text-[11px] font-medium tabular-nums opacity-85"
          >
            {{ formatPct(cell.fraction) }}%
          </span>
        </button>
      </div>
    </template>
  </div>
</template>
