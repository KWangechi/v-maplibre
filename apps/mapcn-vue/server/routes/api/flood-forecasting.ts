const VALID_ENDPOINTS = [
  'floodStatus:queryLatestFloodStatusByGaugeIds',
  'floodStatus:searchLatestFloodStatusByArea',
  'gauges:queryGaugeForecasts',
  'significantEvents',
] as const;

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const apiKey = config.googleFloodApiKey as string;

    if (!apiKey) {
      throw createError({
        statusCode: 503,
        message:
          'Google Flood Forecasting API key not configured. Apply at developers.google.com/flood-forecasting',
      });
    }

    const query = getQuery(event);
    const endpoint = (query.endpoint as string) || 'significantEvents';

    if (
      !VALID_ENDPOINTS.includes(endpoint as (typeof VALID_ENDPOINTS)[number])
    ) {
      throw createError({
        statusCode: 400,
        message: `Invalid endpoint. Supported: ${VALID_ENDPOINTS.join(', ')}`,
      });
    }

    const { endpoint: _, ...apiParams } = query;

    const data = await $fetch(
      `https://floodforecasting.googleapis.com/v1/${endpoint}`,
      {
        headers: {
          Accept: 'application/json',
        },
        query: {
          ...apiParams,
          key: apiKey,
        },
      },
    );

    return data;
  },
  {
    maxAge: 60 * 15,
    getKey: (event) => {
      const query = getQuery(event);
      return `flood-forecasting:${query.endpoint || 'significantEvents'}:${JSON.stringify(query)}`;
    },
  },
);
