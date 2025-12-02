'use client';

import { useEffect, useMemo, useState } from 'react';
import { CompanyOffer, DashboardMetric, DriveFile, Item, OcrInsight, UploadResult } from '../types';

const currency = new Intl.NumberFormat('ar-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

function SummaryBadge({ label, value, trend, variant = 'positive' }: DashboardMetric) {
  return (
    <div className="card">
      <div className="text-slate-600 text-sm mb-2">{label}</div>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold">{value}</p>
        <span
          className={`badge ${
            variant === 'negative'
              ? 'border-red-200 text-red-600 bg-red-50'
              : 'border-emerald-200 text-emerald-600'
          }`}
        >
          <span className="text-xs">{variant === 'negative' ? '▼' : '▲'}</span>
          {trend}%
        </span>
      </div>
    </div>
  );
}

function ItemsTable({ items }: { items: Item[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">حصر الكميات</h2>
        <span className="badge">جاهز للتصدير CSV</span>
      </div>
      <div className="overflow-auto">
        <table className="table text-sm">
          <thead>
            <tr>
              <th>الكود</th>
              <th>الوصف</th>
              <th>الوحدة</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.description}</td>
                <td>{item.unit}</td>
                <td>{item.quantity.toLocaleString('ar-EG')}</td>
                <td>{currency.format(item.unitPrice)}</td>
                <td className="font-semibold">{currency.format(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OfferCard({ offer }: { offer: CompanyOffer }) {
  return (
    <div className="card h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{offer.company}</h3>
        <span className="badge">درجة التقييم: {offer.score}%</span>
      </div>
      <p className="text-2xl font-bold">{currency.format(offer.total)}</p>
      <ul className="text-sm text-slate-600 list-disc pr-4 space-y-1">
        {offer.highlights.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export default function HomePage() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [offers, setOffers] = useState<CompanyOffer[]>([]);
  const [totalValue, setTotalValue] = useState<number | null>(null);
  const [visionInsight, setVisionInsight] = useState<OcrInsight | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [searchUsedFallback, setSearchUsedFallback] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveUsedFallback, setDriveUsedFallback] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);

  const categoryTotals = useMemo(() => {
    return items.reduce<Record<string, { quantity: number; total: number }>>((acc, item) => {
      const bucket = acc[item.category] ?? { quantity: 0, total: 0 };
      bucket.quantity += item.quantity;
      bucket.total += item.quantity * item.unitPrice;
      acc[item.category] = bucket;
      return acc;
    }, {});
  }, [items]);

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setItems(data.items);
      setMetrics(data.dashboardMetrics);
      setOffers(data.companyOffers);
      setTotalValue(data.totalValue);
    }

    fetchAnalytics();
  }, []);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      setLastFile(file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('لم يتم رفع الملف');
      }

      const data = (await response.json()) as UploadResult;
      setUploadResult(data);
      setItems(data.normalizedItems);
      setVisionInsight(null);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleVisionEnhance = async () => {
    if (!lastFile) return;
    const formData = new FormData();
    formData.append('file', lastFile);

    setVisionLoading(true);
    try {
      const response = await fetch('/api/vision', { method: 'POST', body: formData });
      const data = (await response.json()) as OcrInsight;
      setVisionInsight(data);
    } catch (error) {
      console.error(error);
    } finally {
      setVisionLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    const q = query.trim();
    setSearchQuery(q);
    if (!q) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      setSearchResults(data.items || []);
      setSearchUsedFallback(Boolean(data.usedFallback));
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDriveSync = async () => {
    setDriveLoading(true);
    try {
      const response = await fetch('/api/drive');
      const data = await response.json();
      setDriveFiles(data.files || []);
      setDriveUsedFallback(Boolean(data.usedFallback));
    } catch (error) {
      console.error(error);
    } finally {
      setDriveLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <SummaryBadge key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">رفع ملفات PDF و Excel</h2>
              <p className="text-sm text-slate-600">تتم المعالجة فورياً مع تحليل البنود والأرقام</p>
            </div>
            <span className="badge">DocumentAI + Vision OCR</span>
          </div>
          <div className="flex gap-2 mb-2 flex-wrap">
            <button className="button" type="button">رفع ملف جديد</button>
            <button className="button-secondary" type="button">استعراض آخر التقارير</button>
          </div>

          <form className="grid gap-3" onSubmit={handleUpload}>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              اختر ملف المقايسة (PDF أو Excel)
              <input
                name="file"
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                required
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:border-blue-500"
              />
            </label>
            <button type="submit" className="button" disabled={uploading}>
              {uploading ? 'جاري المعالجة...' : 'رفع ومعالجة الملف'}
            </button>
          </form>

          {uploadResult && (
            <div className="mt-4 grid gap-3">
              <div className="badge">تمت قراءة {uploadResult.fileName}</div>
              <p className="text-sm text-slate-700">{uploadResult.extractedText}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="card">
                  <p className="text-slate-500">عدد الأرقام المستخرجة</p>
                  <p className="text-xl font-semibold">{uploadResult.numericFields.length}</p>
                </div>
                <div className="card">
                  <p className="text-slate-500">حجم الملف</p>
                  <p className="text-xl font-semibold">{(uploadResult.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">أمان وعمليات</h2>
            <span className="badge">AES-256 + Signed URLs</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 list-disc pr-4">
            <li>رفع الملفات يتم عبر Signed URL لضمان التحكم في الهوية</li>
            <li>تشفير كامل في الراحة والحركة (AES256 + HTTPS)</li>
            <li>دوال Serverless لمعالجة OCR بدون تحميل على الواجهة</li>
            <li>سجل تدقيق Audit Logs لكل عملية تحميل وتنزيل</li>
            <li>تكامل بحث سريع عبر Meilisearch / ElasticSearch</li>
          </ul>
          <div className="mt-4 card bg-slate-50">
            <p className="text-sm text-slate-700">مسار التشغيل الرسمي</p>
            <p className="text-slate-600 mt-1 text-xs">
              واجهة خفيفة → API Route → PostgreSQL → Cloud Storage → Cloud Functions → Vision OCR → Dashboard
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold">تحسين OCR عبر Google Vision</h2>
              <p className="text-sm text-slate-600">تشغيل Document AI على آخر ملف لزيادة دقة التعرف</p>
            </div>
            <span className="badge">{visionInsight?.usedFallback ? 'Fallback' : 'Cloud Vision'}</span>
          </div>
          <button className="button" type="button" disabled={!lastFile || visionLoading} onClick={handleVisionEnhance}>
            {visionLoading ? 'جاري تحسين الاستخراج...' : 'تشغيل OCR السحابي'}
          </button>
          {visionInsight && (
            <div className="mt-3 text-sm text-slate-700 space-y-2">
              <p className="font-semibold">نص مستخرج</p>
              <p className="card bg-slate-50 whitespace-pre-line">{visionInsight.text.slice(0, 340)}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>عدد الصفحات: {visionInsight.pageCount || 1}</span>
                <span>أرقام مكتشفة: {visionInsight.amounts.length}</span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">بحث لحظي عبر ElasticSearch</h2>
            <span className="badge">{searchUsedFallback ? 'محلي' : 'Elastic'}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="اكتب وصف أو كود البند"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button className="button-secondary" type="button" onClick={() => handleSearch(searchQuery)} disabled={searchLoading}>
              {searchLoading ? '...' : 'بحث'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm text-slate-700 max-h-52 overflow-auto">
              {searchResults.map((item) => (
                <li key={item.id} className="card bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{item.description}</p>
                    <p className="text-xs text-slate-500">{item.id} • {item.category}</p>
                  </div>
                  <span className="badge">{currency.format(item.unitPrice)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">تكامل Google Drive</h2>
            <span className="badge">{driveUsedFallback ? 'Demo' : 'Service'}</span>
          </div>
          <p className="text-sm text-slate-600 mb-2">سحب أحدث ملفات PDF و Excel مباشرة من مجلد العطاءات.</p>
          <button className="button" type="button" onClick={handleDriveSync} disabled={driveLoading}>
            {driveLoading ? 'جاري المزامنة...' : 'مزامنة الملفات'}
          </button>
          {driveFiles.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm text-slate-700 max-h-52 overflow-auto">
              {driveFiles.map((file) => (
                <li key={file.id} className="card bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.mimeType}</p>
                    </div>
                    {file.size && <span className="badge">{(Number(file.size) / 1024).toFixed(1)} KB</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <ItemsTable items={items} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">تحليل أسعار البنود</h2>
          <div className="space-y-2 text-sm text-slate-700">
            {Object.entries(categoryTotals).map(([category, stats]) => (
              <div key={category} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{category}</p>
                  <p className="text-slate-500">كمية: {stats.quantity.toLocaleString('ar-EG')}</p>
                </div>
                <p className="text-lg font-bold">{currency.format(stats.total)}</p>
              </div>
            ))}
            {totalValue && (
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-semibold text-slate-800">
                <p>إجمالي قيمة المقايسة</p>
                <p className="text-xl">{currency.format(totalValue)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">مقارنة عروض الشركات</h2>
            <span className="badge">تقييم آلي</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
            {offers.map((offer) => (
              <OfferCard offer={offer} key={offer.company} />
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">لوحة التقارير السريعة</h2>
          <span className="badge">ElasticSearch / Vision</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-700">
          <div className="card bg-slate-50">
            <p className="text-slate-500 mb-1">البحث في مئات الآلاف من البنود</p>
            <p className="text-slate-700">فهرسة لحظية للبنود مع دعم اقتراحات البحث الذكية والمرادفات.</p>
          </div>
          <div className="card bg-slate-50">
            <p className="text-slate-500 mb-1">التقارير الزمنية</p>
            <p className="text-slate-700">قياس زمن معالجة كل ملف وقياس الاعتمادية مع إشعارات عند البطء.</p>
          </div>
          <div className="card bg-slate-50">
            <p className="text-slate-500 mb-1">الامتثال</p>
            <p className="text-slate-700">حفظ سجل تدقيق شامل لكل عملية تحميل وتنزيل لضمان الحوكمة.</p>
          </div>
          <div className="card bg-slate-50">
            <p className="text-slate-500 mb-1">تحسين الخوارزميات</p>
            <p className="text-slate-700">نموذج تطبيع أرقام يحلل رأس الملف ويستخرج القيم بدقة أعلى مع كشف الفراغات.</p>
          </div>
          <div className="card bg-slate-50">
            <p className="text-slate-500 mb-1">تقارير إضافية</p>
            <p className="text-slate-700">تحليل أسعار البنود، مقارنة العروض، وتتبع التقدم بنسب مؤشرات أداء رئيسية.</p>
          </div>
          <div className="card bg-slate-50">
            <p className="text-slate-500 mb-1">تكامل السحابة</p>
            <p className="text-slate-700">Google Drive للملفات و Vision OCR للنصوص مع جاهزية للتشغيل عبر Functions.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
