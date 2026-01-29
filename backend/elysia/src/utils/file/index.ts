import { unlink } from 'node:fs/promises';
import { extname } from 'node:path';

import { env } from '@/utils/config';

export async function upload(file: File) {
  const name = `${crypto.randomUUID()}${extname(file.name)}`;
  await Bun.write(`${env.UPLOAD_DIR}/${name}`, file);
  return name;
}

export async function remove(name: string) {
  return await unlink(`${env.UPLOAD_DIR}/${name}`);
}
