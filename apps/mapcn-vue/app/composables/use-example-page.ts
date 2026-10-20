import type { Component, InjectionKey } from 'vue';

// The example pages themselves are the previews: each one renders its map
// inside <ComponentDemo>, which shows only the map when a gallery preview
// provides `GALLERY_PREVIEW_KEY`. Same modules as the routes, so a preview
// and its page share one lazy chunk.
const pageModules = import.meta.glob<{ default: Component }>(
  '~/pages/examples/*.vue',
);

const cache = new Map<string, Component>();

/** Lazy example page for an `/examples/<slug>` href, or `null` if none exists. */
export function useExamplePage(href: string): Component | null {
  const cached = cache.get(href);
  if (cached) return cached;
  const slug = href.split('/').pop() ?? '';
  const key = Object.keys(pageModules).find((k) =>
    k.endsWith(`/examples/${slug}.vue`),
  );
  const loader = key ? pageModules[key] : undefined;
  if (!loader) return null;
  const component = defineAsyncComponent(loader);
  cache.set(href, component);
  return component;
}

/** Provided by gallery previews; `<ComponentDemo>` then renders only its map. */
export const GALLERY_PREVIEW_KEY = Symbol(
  'gallery-preview',
) as InjectionKey<boolean>;
