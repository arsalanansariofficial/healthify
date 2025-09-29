import path from 'path';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { DIRECTORIES, HTTP_STATUS, MESSAGES } from '@/lib/constants';

const dir = path.join(process.cwd(), DIRECTORIES.PUBLIC as string);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const buffer = formData.get('file') as File;

    if (!buffer || !(buffer instanceof File)) {
      return NextResponse.json(
        { success: false, message: MESSAGES.FILE.INVALID_FORMAT },
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
      { file, success: true, message: MESSAGES.FILE.UPLOADED },
      { status: HTTP_STATUS.CREATED as number }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: MESSAGES.FILE.UPLOAD_FAILED },
      { status: HTTP_STATUS.SERVER_ERROR as number }
    );
  }
}
