import {
  onMounted,
  onUnmounted,
  onUpdated,
  type Ref,
  type ShallowRef,
} from 'vue';
import type { Map, IControl, ControlPosition } from 'maplibre-gl';

/**
 * Register a Vue component as a MapLibre IControl for proper control stacking.
 *
 * @param map - Ref to the MapLibre map instance
 * @param containerRef - Ref to the component's root HTMLElement
 * @param position - Control position ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')
 */
export function useMapControl(
  map: ShallowRef<Map | null> | Ref<Map | null>,
  containerRef: Ref<HTMLElement | null>,
  position: ControlPosition,
): void {
  let control: IControl | null = null;
  let isAdded = false;

  /**
   * Re-add the maplibregl-ctrl class if Vue's :class reconciliation removed it.
   * Vue overwrites the class attribute when dynamic :class bindings update,
   * which drops imperatively-added classes like maplibregl-ctrl.
   */
  const ensureControlClass = () => {
    if (
      isAdded &&
      containerRef.value &&
      !containerRef.value.classList.contains('maplibregl-ctrl')
    ) {
      containerRef.value.classList.add('maplibregl-ctrl');
    }
  };

  onMounted(() => {
    if (!map.value || !containerRef.value) return;

    control = {
      onAdd: (): HTMLElement => {
        containerRef.value?.classList.add('maplibregl-ctrl');
        return containerRef.value!;
      },
      onRemove: (): void => {},
    };

    map.value.addControl(control, position);
    isAdded = true;
  });

  onUpdated(() => {
    ensureControlClass();
  });

  onUnmounted(() => {
    if (map.value && control) {
      try {
        map.value.removeControl(control);
      } catch {
        // Control may already be removed if map was destroyed
      }
    }
  });
}
