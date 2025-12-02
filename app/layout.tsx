import './globals.css';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'AZOCR | منصة إدارة المقايسات والـ OCR',
  description: 'MVP لواجهة رفع المستندات وتحليل البنود والبحث السريع.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Image src="https://al-azab.co/img/Alazab.svg" alt="شعار العزب" width={120} height={40} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-600">MVP</p>
                <h1 className="text-2xl font-bold text-slate-900">AZOCR</h1>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <p className="text-sm text-slate-600">
                واجهة أولية لجمع ملفات المقايسات وتحليل البنود مع تكامل OCR وبحث سريع
              </p>
              <button className="button-ghost" type="button">دليل التشغيل</button>
              <button className="button-secondary" type="button">دخول المشرف</button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
