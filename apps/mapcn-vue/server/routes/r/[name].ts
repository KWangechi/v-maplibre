import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REGISTRY_DIR = resolve(
  process.cwd(),
  '../../packages/mapcn-vue/public/r',
);

export default defineEventHandler((event) => {
  const rawName = getRouterParam(event, 'name');
  const name = rawName?.replace(/\.json$/, '');

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Missing name parameter',
    });
  }

  const filePath = join(REGISTRY_DIR, `${name}.json`);

  if (!existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      message: `Registry item "${name}" not found`,
    });
  }

  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
});
