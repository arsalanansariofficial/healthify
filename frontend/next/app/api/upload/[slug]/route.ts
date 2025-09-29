import path from 'path';
import mime from 'mime';
import { NextResponse } from 'next/server';
import { readFile, unlink } from 'fs/promises';

import {
  MESSAGES,
  HTTP_STATUS,
  DIRECTORIES,
  HTTP_MESSAGES
} from '@/lib/constants';

const dir = path.join(process.cwd(), DIRECTORIES.PUBLIC as string);

export async function GET(
  _: Request,
  { params }: RouteContext<'/api/upload/[slug]'>
) {
  try {
    const { slug } = await params;
    const file = path.join(dir, slug);
    const buffer = await readFile(file);

    return new Response(new Uint8Array(buffer), {
      status: HTTP_STATUS.OK as number,
      headers: new Headers({
        'Content-Disposition': `inline; filename="${slug}"`,
        'Content-Type': mime.getType(file) || 'application/octet-stream'
      })
    });
  } catch {
    return NextResponse.json(
      { success: false, message: HTTP_MESSAGES.SERVER_ERROR },
      { status: HTTP_STATUS.SERVER_ERROR as number }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: RouteContext<'/api/upload/[slug]'>
) {
  try {
    await unlink(path.join(dir, (await params).slug));
    return NextResponse.json(
      { success: true, message: MESSAGES.FILE.REMOVED },
      { status: HTTP_STATUS.OK as number }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: MESSAGES.FILE.DELETE_FAILED },
      { status: HTTP_STATUS.SERVER_ERROR as number }
    );
  }
}
