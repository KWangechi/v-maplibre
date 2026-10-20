import type { Ref } from 'vue';

// Every live preview is a full MapLibre map, often with a deck.gl overlay on
// its own WebGL canvas, plus its tiles and data. Desktop Chrome caps live
// WebGL contexts at 16 and evicts the oldest; iOS Safari kills the whole
// tab under GPU/memory pressure instead. So only a few previews run at once
// (2 on touch devices, whose GPU memory is far smaller); the rest wait until
// a visible slot frees up. Module state is client-only: previews mount
// inside <ClientOnly>.
const MAX_LIVE_DESKTOP = 6;
const MAX_LIVE_TOUCH = 2;

let maxLive = MAX_LIVE_DESKTOP;
if (import.meta.client && window.matchMedia('(pointer: coarse)').matches) {
  maxLive = MAX_LIVE_TOUCH;
}
const MAX_LIVE = maxLive;
const live = ref<string[]>([]);
const waiting = ref<string[]>([]);

function release(id: string): void {
  live.value = live.value.filter((x) => x !== id);
  waiting.value = waiting.value.filter((x) => x !== id);
  const next = waiting.value[0];
  if (next && live.value.length < MAX_LIVE) {
    waiting.value = waiting.value.slice(1);
    live.value = [...live.value, next];
  }
}

function request(id: string): void {
  if (live.value.includes(id) || waiting.value.includes(id)) return;
  if (live.value.length < MAX_LIVE) live.value = [...live.value, id];
  else waiting.value = [...waiting.value, id];
}

/** `true` while this preview holds one of the live map slots. */
export function useLivePreview(
  id: string,
  visible: Ref<boolean>,
): Ref<boolean> {
  watch(visible, (isVisible) => (isVisible ? request(id) : release(id)), {
    immediate: true,
  });
  onBeforeUnmount(() => release(id));
  return computed(() => live.value.includes(id));
}
