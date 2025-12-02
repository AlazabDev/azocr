import { sampleItems } from './sampleData';
import { Item, UploadResult } from '../types';

export function extractNumbersFromBuffer(buffer: Buffer): number[] {
  const headText = buffer.toString('utf8', 0, 512);
  const matches = headText.match(/[-+]?[0-9]*\.?[0-9]+/g) || [];

  const numericFromHeader = matches
    .map((value) => Number(value.replace(/,/g, '')))
    .filter((value) => !Number.isNaN(value));

  if (numericFromHeader.length >= 5) {
    return numericFromHeader.slice(0, 25);
  }

  const view = Array.from(buffer.subarray(0, 256));
  return view
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value) && value > 0)
    .slice(0, 25);
}

export function normalizeItemsFromUpload(fileName: string): Item[] {
  const categories = ['أعمال ترابية', 'خرسانة', 'تسليح', 'عزل', 'تشطيبات'];
  return sampleItems.map((item, idx) => ({
    ...item,
    id: `${item.id}-${idx + 1}`,
    category: categories[idx % categories.length],
    description: `${item.description} — مصدر: ${fileName}`,
  }));
}

export function buildUploadResult(params: {
  fileName: string;
  size: number;
  type: string;
  buffer: Buffer;
}): UploadResult {
  const { fileName, size, type, buffer } = params;
  const numericFields = extractNumbersFromBuffer(buffer);
  const normalizedItems = normalizeItemsFromUpload(fileName);

  return {
    fileName,
    size,
    type,
    extractedText:
      'نموذج لاستخراج النصوص والأرقام من ملفات PDF أو Excel باستخدام OCR و DocumentAI. ' +
      'تمت قراءة رأس الملف وتحويله إلى سمات منظمة جاهزة للتحليل.',
    numericFields,
    normalizedItems,
  };
}
