import { unlink } from 'node:fs/promises';
import { extname } from 'node:path';

import { env } from '@/lib/config';

export async function upload(file: File) {
  const name = `${crypto.randomUUID()}${extname(file.name)}`;
  await Bun.write(`${env.UPLOAD_DIR}/${name}`, file);
  return `${env.BASE_URL}/${env.UPLOAD_DIR}/${name}`;
}

export async function remove(url?: string | null) {
  if (!url) return;
  const [, name] = url.split(env.UPLOAD_DIR);
  return await unlink(`${env.UPLOAD_DIR}/${name}`);
}
