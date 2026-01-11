'use server';

import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';

import { DIRECTORIES } from '@/lib/constants';

const dir = path.join(process.cwd(), DIRECTORIES.PUBLIC as string);

export async function removeFile(slug: string) {
  await unlink(path.join(dir, slug));
}

export async function saveFile(file: File) {
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, file.name),
    Buffer.from(await file.arrayBuffer())
  );
}
