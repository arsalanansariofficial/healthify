import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

import * as CONST from '@/lib/constants';

const dir = path.join(process.cwd(), CONST.USER_DIR);

export async function POST(request: Request) {
  try {
    const file = (await request.formData())?.get('image') as File;
    const fileName = `${randomUUID()}.${file?.type?.split(CONST.HOME).at(-1)}`;

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, fileName),
      Buffer.from(await file.arrayBuffer())
    );

    return Response.json({ success: true, message: CONST.FILE_UPLOADED });
  } catch {
    return Response.json({ success: false, message: CONST.UPLOAD_FAILED });
  }
}

export async function DELETE(request: Request) {
  try {
    const formData = await request.formData();
    await fs.unlink(path.join(dir, `${formData.get('image')}`));
    return Response.json({ success: true, message: CONST.FILE_REMOVED });
  } catch {
    return Response.json({ success: false, message: CONST.FILE_UPLOADED });
  }
}
