import { extname } from 'node:path';

import type { Schema } from '@/lib/util/schema';

import { isFile } from '@/lib/util';
import { env } from '@/lib/config';

export async function replace(params: {
  replaceWith?: Schema['fileOrUrl'] | null;
  url?: string | null;
}) {
  if (params.replaceWith !== undefined && params.url) await remove(params.url);
  if (isFile(params.replaceWith)) return await upload(params.replaceWith);
  return params.replaceWith;
}

export async function upload(file: File) {
  const name = `${crypto.randomUUID()}${extname(file.name)}`;
  await Bun.write(`${env.UPLOAD_DIR}/${name}`, file);
  return `${env.BASE_URL}/${env.UPLOAD_DIR}/${name}`;
}

export async function remove(url?: string | null) {
  if (!url) return;
  const [, name] = url.split(env.UPLOAD_DIR);
  return await Bun.file(`${env.UPLOAD_DIR}${name}`).delete();
}
