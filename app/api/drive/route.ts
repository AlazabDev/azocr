import { NextResponse } from 'next/server';
import { listDriveFiles } from '../../../lib/drive';

export const revalidate = 0;

export async function GET() {
  const result = await listDriveFiles();
  return NextResponse.json(result);
}
