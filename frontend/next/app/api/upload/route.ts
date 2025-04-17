import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

import * as CONST from '@/lib/constants';

const dir = path.join(process.cwd(), CONST.USER_DIR);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file || !(file instanceof File)) {
      return Response.json(
        { success: false, message: CONST.INVALID_IMAGE_FORMAT },
        {
          status: CONST.BAD_REQUEST_CODE,
          statusText: CONST.BAD_REQUEST_MESSAGE
        }
      );
    }

    const extension = file.type.split('/').pop();
    const image = `${randomUUID()}.${extension}`;

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, image),
      Buffer.from(await file.arrayBuffer())
    );

    return Response.json(
      { image, success: true, message: CONST.FILE_UPLOADED },
      { status: CONST.RESPONSE_WRITTEN_CODE, statusText: CONST.FILE_UPLOADED }
    );
  } catch {
    return Response.json(
      { success: false, message: CONST.UPLOAD_FAILED },
      {
        status: CONST.SERVER_ERROR_CODE,
        statusText: CONST.SERVER_ERROR_MESSAGE
      }
    );
  }
}
