import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import * as CONST from '@/lib/constants';

const dir = path.join(process.cwd(), CONST.USER_DIR);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const buffer = formData.get('file') as File;

    if (!buffer || !(buffer instanceof File)) {
      return NextResponse.json(
        { success: false, message: CONST.INVALID_IMAGE_FORMAT },
        { status: CONST.BAD_REQUEST_CODE }
      );
    }

    const file = `${randomUUID()}.${buffer.type.split('/').pop()}`;

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, file),
      Buffer.from(await buffer.arrayBuffer())
    );

    return NextResponse.json(
      { file, success: true, message: CONST.FILE_UPLOADED },
      { status: CONST.RESPONSE_WRITTEN_CODE }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: CONST.UPLOAD_FAILED },
      { status: CONST.SERVER_ERROR_CODE }
    );
  }
}
