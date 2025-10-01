import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

import { DIRECTORIES, HTTP_STATUS, MESSAGES } from '@/lib/constants';

const dir = path.join(process.cwd(), DIRECTORIES.PUBLIC as string);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const buffer = formData.get('file') as File;

    if (!buffer || !(buffer instanceof File)) {
      return NextResponse.json(
        { message: MESSAGES.FILE.INVALID_FORMAT, success: false },
        { status: HTTP_STATUS.BAD_REQUEST as number }
      );
    }

    const file = `${randomUUID()}.${buffer.type.split('/').pop()}`;

    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, file),
      Buffer.from(await buffer.arrayBuffer())
    );

    return NextResponse.json(
      { file, message: MESSAGES.FILE.UPLOADED, success: true },
      { status: HTTP_STATUS.CREATED as number }
    );
  } catch {
    return NextResponse.json(
      { message: MESSAGES.FILE.UPLOAD_FAILED, success: false },
      { status: HTTP_STATUS.SERVER_ERROR as number }
    );
  }
}
