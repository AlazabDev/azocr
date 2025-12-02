# AZOCR

نسخة أولية (MVP) لمنصة OCR وتحليل المقايسات. تم بناء الواجهة باستخدام Next.js مع مسارات API خفيفة لمعالجة الملفات واستخراج البنود.

## المزايا في هذه النسخة
- رفع ملفات PDF وExcel ومعالجتها فورياً عبر `/api/upload`.
- استخراج نصوص وأرقام مبدئية وتحويلها إلى بنود موحدة قابلة للتحليل.
- لوحة حصر كميات، تحليل أسعار البنود، ومقارنة عروض الشركات.
- لوحة تقارير تبرز السرعة والجودة والأمان مع قابلية دمج محركات البحث (ElasticSearch/Meilisearch).
- تكاملات جاهزة مع Google Vision OCR وElasticSearch وGoogle Drive مع حالات Fallback محلية للتجربة.

## التشغيل محلياً
```bash
npm install
npm run dev
```
ثم افتح `http://localhost:3000` لعرض الواجهة.

## خارطة التكامل
- قاعدة البيانات: PostgreSQL / Supabase لتخزين البنود والملفات الوصفية.
- التخزين: Google Drive أو Google Cloud Storage مع Signed URLs.
- المعالجة: Cloud Functions لتشغيل OCR (Vision / DocumentAI) عند رفع الملفات.
- البحث: Meilisearch / ElasticSearch لفهرسة البنود والوثائق.

## الهيكل الحالي
- `app/page.tsx`: واجهة الرفع والتحليلات ولوحات التقارير، مع بطاقات OCR السحابي والبحث والفهرسة والتكامل مع Drive.
- `app/api/upload/route.ts`: استقبال الملفات وإرجاع نتائج استخراج مبدئية.
- `app/api/analytics/route.ts`: إرجاع بيانات تجريبية لحصر الكميات والعروض.
- `app/api/vision/route.ts`: تمرير الملف إلى Google Vision OCR (أو Fallback محلي) وإرجاع النصوص والأرقام المستخرجة.
- `app/api/search/route.ts`: بحث لحظي في البنود عبر ElasticSearch أو بدائل محلية.
- `app/api/drive/route.ts`: مزامنة قائمة ملفات من Google Drive مع عينات Fallback.
- `lib/*`: بيانات توضيحية ودوال مساعدة للتطبيع والاستخراج والفهرسة.

## الإعدادات البيئية المطلوبة للتكاملات
ضع المتغيرات التالية في `.env.local` قبل التشغيل الإنتاجي:

```bash
# Google Cloud Vision / Document AI
GOOGLE_PROJECT_ID=your-project
# أحد الخيارين التاليين
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
# أو
GOOGLE_CLOUD_CREDENTIALS='{"client_email":"...","private_key":"..."}'

# ElasticSearch
ELASTICSEARCH_URL=https://your-elastic-host:9200
ELASTICSEARCH_INDEX=azocr-items
ELASTICSEARCH_API_KEY=base64key

# Google Drive Service Account
GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON='{"client_email":"...","private_key":"..."}'
```

> هذه النسخة قابلة للتطوير بإضافة الربط الفعلي مع OCR وقواعد البيانات وتسجيل الـ Audit Logs.
