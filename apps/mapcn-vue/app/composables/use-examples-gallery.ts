import type { Example, ExampleCategory } from '~/types/examples';

/** The "All" chip: every category, featured bento on top. */
export const ALL_CATEGORIES = 'all';

// The first picks of the Featured category form the bento above the gallery.
// Order matters: the bento renders `lg sm sm / sm sm lg`.
const FEATURED_ID = 'featured';
const BENTO_SIZE = 6;

function matches(example: Example, q: string): boolean {
  return [example.title, example.description, example.badge ?? '']
    .join(' ')
    .toLowerCase()
    .includes(q);
}

/**
 * State for the /examples gallery: the featured bento, category chips and a
 * text filter over title, description and badge.
 */
export function useExamplesGallery() {
  const { categories, totalExamples } = useExamplesData();

  const featured = (
    categories.find((c) => c.id === FEATURED_ID)?.examples ?? []
  ).slice(0, BENTO_SIZE);

  const query = ref('');
  const active = ref(ALL_CATEGORIES);

  const chips = computed(() => [
    { id: ALL_CATEGORIES, title: 'All', count: toValue(totalExamples) },
    ...categories.map((c) => ({
      id: c.id,
      title: c.title,
      count: c.examples.length,
    })),
  ]);

  const filtering = computed(() => query.value.trim().length > 0);

  // The bento only shows on the unfiltered "All" view.
  const showFeatured = computed(
    () => active.value === ALL_CATEGORIES && !filtering.value,
  );

  const visible = computed<ExampleCategory[]>(() => {
    const q = query.value.trim().toLowerCase();
    const source =
      active.value === ALL_CATEGORIES
        ? categories
        : categories.filter((c) => c.id === active.value);
    // An example listed in two categories shows once in filter results.
    const seen = new Set<string>();
    return source
      .map((c) => ({
        ...c,
        examples: c.examples.filter((e) => {
          if (q && !matches(e, q)) return false;
          if (q && seen.has(e.href)) return false;
          seen.add(e.href);
          return true;
        }),
      }))
      .filter((c) => c.examples.length > 0);
  });

  const matchCount = computed(() =>
    visible.value.reduce((n, c) => n + c.examples.length, 0),
  );

  function reset(): void {
    query.value = '';
    active.value = ALL_CATEGORIES;
  }

  return {
    featured,
    chips,
    query,
    active,
    visible,
    showFeatured,
    matchCount,
    totalExamples,
    reset,
  };
}
