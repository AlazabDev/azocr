import { NextRequest, NextResponse } from 'next/server';
import { searchItems } from '../../../lib/search';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json({ items: [], usedFallback: true });
  }

  const result = await searchItems(query);
  return NextResponse.json(result);
}
