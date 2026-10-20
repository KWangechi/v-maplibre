/**
 * Detects HEADLESS automated browsers (Lighthouse, WebMCP scanners, headless
 * CI) so heavy WebGL map demos can render a static fallback instead of
 * mounting a live MapLibre instance.
 *
 * Why headless only: the original gate keyed off `navigator.webdriver === true`,
 * which is set by EVERY automation harness — including headed ones (Playwright
 * headed, Selenium headed) and the QA sweep that renders these pages. That
 * replaced the map with a text placeholder for anyone driving a real browser,
 * even though a headed browser has a real GPU and renders the map fine. The
 * problem this gate exists to solve is a headless scanner never reaching
 * `networkidle` while the map streams tiles, so the signal has to be
 * "headless", not "automated".
 *
 * SSR-safe: defaults to `false` on the server and is set once on mount.
 */
export function useIsHeadlessScanner() {
  const isHeadlessScanner = ref(false);

  onMounted(() => {
    isHeadlessScanner.value =
      navigator.webdriver === true &&
      /HeadlessChrome/i.test(navigator.userAgent);
  });

  return { isHeadlessScanner };
}
