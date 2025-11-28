import path from 'path';
import mime from 'mime';
import fs, { readFile } from 'fs/promises';

import * as CONST from '@/lib/constants';
import { NextResponse } from 'next/server';

const dir = path.join(process.cwd(), CONST.PUBLIC_DIR);

type Params = RouteContext<'/api/upload/[slug]'>;

export async function GET(_: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const image = path.join(dir, slug);
    const buffer = await readFile(image);

    return new Response(new Uint8Array(buffer), {
      status: CONST.RESPONSE_OK_CODE,
      headers: new Headers({
        'Content-Disposition': `inline; filename="${slug}"`,
        'Content-Type': mime.getType(image) || CONST.OCTET_STREAM
      })
    });
  } catch {
    return NextResponse.json(
      { success: false, message: CONST.SERVER_ERROR_MESSAGE },
      { status: CONST.SERVER_ERROR_CODE }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await fs.unlink(path.join(dir, (await params).slug));
    return NextResponse.json(
      { success: true, message: CONST.FILE_REMOVED },
      { status: CONST.RESPONSE_OK_CODE }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: CONST.DELETE_FAILED },
      { status: CONST.SERVER_ERROR_CODE }
    );
  }
}
