'use server';

import { DOMAIN } from '@/lib/constants';

export async function removeFile(slug: string) {
  const result = await fetch(`${DOMAIN.LOCAL}/api/upload/${slug}`, {
    method: 'DELETE'
  });

  const response = await result.json();
  if (!response.success) throw new Error(response.message);
}

export async function saveFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const result = await fetch(`${DOMAIN.LOCAL}/api/upload`, {
    method: 'POST',
    body: formData
  });

  const response = await result.json();
  if (!response.success) throw new Error(response.message);
  return response.file as string;
}
