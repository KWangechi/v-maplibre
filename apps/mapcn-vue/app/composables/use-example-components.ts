import type { MaybeRefOrGetter } from 'vue';
import type { ExampleComponentRef } from '~/types/examples';

// `import { VMap, VControlScale } from '@geoql/v-maplibre'` and subpath entries
// such as `@geoql/v-maplibre/deck.gl` or `@geoql/v-maplibre/lidar`.
// Type-only imports are skipped.
const IMPORT_RE =
  /import\s+(?!type\b)\{([^}]+)\}\s+from\s+['"](@geoql\/v-maplibre(?:\/[\w.-]+)?)['"]/g;

/**
 * Lists the `@geoql/v-maplibre` components an example's Usage snippet
 * imports, so the page can name them in server-rendered HTML.
 */
export function useExampleComponents(code: MaybeRefOrGetter<string>) {
  return computed<ExampleComponentRef[]>(() => {
    const seen = new Set<string>();
    const refs: ExampleComponentRef[] = [];
    for (const match of toValue(code).matchAll(IMPORT_RE)) {
      const [, names = '', from = ''] = match;
      for (const raw of names.split(',')) {
        const name = raw
          .replace(/^\s*type\s+/, '')
          .split(/\s+as\s+/)[0]
          ?.trim();
        // Components only: PascalCase `V*` exports, not helpers or types.
        if (!name || !/^V[A-Z]/.test(name) || seen.has(name)) continue;
        if (/^\s*type\s/.test(raw)) continue;
        seen.add(name);
        refs.push({ name, from });
      }
    }
    return refs;
  });
}
