// The web bundle's own Highlighter type: its languages and themes differ from
// the full `shiki` bundle, so the root `Highlighter` type does not match.
import type { Highlighter } from 'shiki/bundle/web';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> | null {
  if (!import.meta.client) return null;
  if (!highlighterPromise) {
    highlighterPromise = import('shiki/bundle/web').then((mod) =>
      mod.createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['vue', 'bash', 'typescript'],
      }),
    );
  }
  return highlighterPromise;
}

export function useShiki(code: Ref<string | undefined>, lang: Ref<string>) {
  const highlightedHtml = ref('');
  const colorMode = useColorMode();

  async function highlight() {
    // Check for code first: empty callers must not load Shiki at all.
    const raw = code.value;
    if (!raw) {
      highlightedHtml.value = '';
      return;
    }
    const shikiPromise = getHighlighter();
    if (!shikiPromise) return;
    const shiki = await shikiPromise;
    const theme = colorMode.value === 'dark' ? 'github-dark' : 'github-light';
    highlightedHtml.value = shiki.codeToHtml(raw, {
      lang: lang.value,
      theme,
    });
  }

  watch([code, lang, colorMode], () => highlight(), { immediate: true });

  return { highlightedHtml };
}
