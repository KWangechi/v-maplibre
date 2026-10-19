export default {
  'apps/mapcn-vue/**/*.{js,jsx,ts,tsx,vue}': [
    'pnpm --filter @geoql/mapcn-vue-app run format',
    'pnpm --filter @geoql/mapcn-vue-app run lint:fix',
  ],
  '*.{js,jsx,ts,tsx,vue}': [
    'vp lint --fix',
    'vp fmt --write --no-error-on-unmatched-pattern',
  ],
  '*.{json,md,yml,yaml,css,html}': [
    'vp fmt --write --no-error-on-unmatched-pattern',
  ],
};
