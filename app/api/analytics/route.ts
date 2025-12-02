import { NextResponse } from 'next/server';
import { aggregateByCategory, companyOffers, dashboardMetrics, sampleItems } from '../../../lib/sampleData';

export const revalidate = 0;

export async function GET() {
  const categoryTotals = aggregateByCategory(sampleItems);
  const totalValue = sampleItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  return NextResponse.json({
    items: sampleItems,
    categoryTotals,
    companyOffers,
    dashboardMetrics,
    totalValue,
  });
}
