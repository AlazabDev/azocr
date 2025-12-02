import { NextRequest, NextResponse } from 'next/server';
import { runVisionOcr } from '../../../lib/vision';

export const runtime = 'nodejs';
export const maxDuration = 20;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ message: 'يرجى إرفاق ملف PDF أو صورة' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const insight = await runVisionOcr(buffer);

  return NextResponse.json(insight);
}
