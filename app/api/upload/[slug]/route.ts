import path from 'path';
import mime from 'mime';
import fs, { readFile } from 'fs/promises';

import * as CONST from '@/lib/constants';

const dir = path.join(process.cwd(), CONST.USER_DIR);

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
    return Response.json(
      { success: false, message: CONST.SERVER_ERROR_MESSAGE },
      {
        status: CONST.SERVER_ERROR_CODE,
        statusText: CONST.SERVER_ERROR_MESSAGE
      }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await fs.unlink(path.join(dir, (await params).slug));

    return Response.json(
      { success: true, message: CONST.FILE_REMOVED },
      { status: CONST.RESPONSE_OK_CODE, statusText: CONST.FILE_REMOVED }
    );
  } catch {
    return Response.json(
      { success: false, message: CONST.DELETE_FAILED },
      {
        status: CONST.SERVER_ERROR_CODE,
        statusText: CONST.SERVER_ERROR_MESSAGE
      }
    );
  }
}
