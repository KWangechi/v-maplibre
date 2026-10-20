import type { Ref } from 'vue';

// Every live preview is a full MapLibre map, often with a deck.gl overlay on
// its own WebGL canvas. Browsers cap live WebGL contexts at about 16 per
// page and drop the oldest past that, so only a few previews may run at
// once; the rest wait until a visible slot frees up. Module state is
// client-only: previews mount inside <ClientOnly>.
const MAX_LIVE = 6;
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
