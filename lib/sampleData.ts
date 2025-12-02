import { CompanyOffer, DashboardMetric, Item } from '../types';

export const sampleItems: Item[] = [
  {
    id: 'ITM-001',
    description: 'أعمال حفر وتمهيد موقع المشروع',
    unit: 'م2',
    quantity: 1250,
    unitPrice: 45,
    category: 'أعمال ترابية',
  },
  {
    id: 'ITM-002',
    description: 'خرسانة عادية للأساسات بسمك 10 سم',
    unit: 'م3',
    quantity: 320,
    unitPrice: 375,
    category: 'خرسانة',
  },
  {
    id: 'ITM-003',
    description: 'حديد تسليح عالي الشد قطر 16 مم',
    unit: 'طن',
    quantity: 25,
    unitPrice: 24800,
    category: 'تسليح',
  },
  {
    id: 'ITM-004',
    description: 'أعمال عزل بيتومين للأرضيات',
    unit: 'م2',
    quantity: 900,
    unitPrice: 120,
    category: 'عزل',
  },
  {
    id: 'ITM-005',
    description: 'توريد وتركيب سيراميك أرضيات 60x60',
    unit: 'م2',
    quantity: 450,
    unitPrice: 210,
    category: 'تشطيبات',
  },
];

export const companyOffers: CompanyOffer[] = [
  {
    company: 'مجموعة البنيان',
    total: 3_240_000,
    score: 92,
    highlights: ['أقل سعر في البنود الخرسانية', 'خبرة 15 سنة في مشاريع مماثلة'],
  },
  {
    company: 'تحالف الرواد',
    total: 3_480_000,
    score: 88,
    highlights: ['أفضل شروط دفع', 'فريق تصميم وتنفيذ متكامل'],
  },
  {
    company: 'شركة الإتقان',
    total: 3_610_000,
    score: 85,
    highlights: ['ضمان ممتد للأعمال الكهرو ميكانيكية', 'توفر طاقم QC داخلي'],
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: 'إجمالي أوامر التوريد', value: '3.24M', trend: 4.2, variant: 'positive' },
  { label: 'سعر متوسط للبند', value: '12,430', trend: -1.4, variant: 'negative' },
  { label: 'سرعة معالجة ملف', value: '2.8s', trend: 18.0, variant: 'positive' },
  { label: 'نسبة المطابقة مع OCR', value: '96%', trend: 2.3, variant: 'positive' },
  { label: 'عدد البنود المعالجة', value: '148,500', trend: 5.6 },
  { label: 'حجم الملفات المؤرشفة', value: '1.3TB', trend: 7.1 },
];

export function aggregateByCategory(items: Item[]) {
  return items.reduce<Record<string, { quantity: number; total: number }>>((acc, item) => {
    const bucket = acc[item.category] ?? { quantity: 0, total: 0 };
    bucket.quantity += item.quantity;
    bucket.total += item.quantity * item.unitPrice;
    acc[item.category] = bucket;
    return acc;
  }, {});
}

export function normalizeExcelRows(rows: Array<Record<string, unknown>>): Item[] {
  return rows.map((row, idx) => ({
    id: String(row['code'] ?? `XLS-${idx + 1}`),
    description: String(row['description'] ?? 'بند غير معروف'),
    unit: String(row['unit'] ?? 'وحدة'),
    quantity: Number(row['qty'] ?? 0),
    unitPrice: Number(row['unitPrice'] ?? 0),
    category: String(row['category'] ?? 'متنوع'),
  }));
}
