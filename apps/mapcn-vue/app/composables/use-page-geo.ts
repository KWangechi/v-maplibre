/**
 * Composable for setting per-page SEO + Generative Engine Optimization meta.
 * Wraps usePageSeo and adds WebPage schema for structured data.
 */
import type { PageSeoOptions } from './use-page-seo';

export interface PageGeoOptions extends PageSeoOptions {
  dateModified?: string;
}

export function usePageGeo(options: PageGeoOptions) {
  const config = useRuntimeConfig();

  usePageSeo(options);

  useSchemaOrg([
    defineWebPage({
      name: options.title,
      description: options.description,
      dateModified: options.dateModified ?? config.public.library.releasedAt,
    }),
  ]);
}
