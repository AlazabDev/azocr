import { NextRequest, NextResponse } from 'next/server';
import { buildUploadResult } from '../../../lib/extraction';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ message: 'لم يتم استلام أي ملف' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploadResult = buildUploadResult({
    fileName: file.name,
    size: buffer.byteLength,
    type: file.type || 'application/octet-stream',
    buffer,
  });

  return NextResponse.json(uploadResult);
}
