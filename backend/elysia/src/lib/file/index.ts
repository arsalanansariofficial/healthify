import { unlink } from 'node:fs/promises';
import { extname } from 'node:path';

import { env } from '@/lib/config';

export async function upload(file: File) {
  const name = `${crypto.randomUUID()}${extname(file.name)}`;
  await Bun.write(`${env.UPLOAD_DIR}/${name}`, file);
  return name;
}

export async function remove(name?: string | null) {
  if (!name) return;
  return await unlink(`${env.UPLOAD_DIR}/${name}`);
}
