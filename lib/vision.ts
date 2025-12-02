import vision from '@google-cloud/vision';
import { OcrInsight } from '../types';

function buildVisionClient() {
  if (!process.env.GOOGLE_PROJECT_ID) return null;

  const credentialsJSON = process.env.GOOGLE_CLOUD_CREDENTIALS;
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    const client = new vision.ImageAnnotatorClient({
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename,
      credentials: credentialsJSON ? JSON.parse(credentialsJSON) : undefined,
    });
    return client;
  } catch (error) {
    console.error('Failed to initialize Vision client', error);
    return null;
  }
}

const visionClient = buildVisionClient();

function fallbackInsight(buffer: Buffer): OcrInsight {
  const textPreview = buffer.toString('utf8', 0, 240);
  const amounts = (textPreview.match(/[-+]?[0-9]*\.?[0-9]+/g) || [])
    .map((value) => Number(value.replace(/,/g, '')))
    .filter((value) => !Number.isNaN(value));

  return {
    text:
      textPreview.length > 0
        ? `معاينة أولية من المحتوى: ${textPreview}`
        : 'تعذر استخراج نص واضح من الملف، تم استخدام عينة الرأس فقط.',
    amounts: amounts.slice(0, 20),
    pageCount: 1,
    languageHints: ['ar', 'en'],
    usedFallback: true,
  };
}

export async function runVisionOcr(buffer: Buffer): Promise<OcrInsight> {
  if (!visionClient) {
    return fallbackInsight(buffer);
  }

  try {
    const [result] = await visionClient.documentTextDetection({
      image: { content: buffer },
      imageContext: { languageHints: ['ar', 'en'] },
    });

    const text = result.fullTextAnnotation?.text ?? '';
    const pageCount = result.fullTextAnnotation?.pages?.length ?? 0;
    const amounts = (text.match(/[-+]?[0-9]*\.?[0-9]+/g) || [])
      .map((value) => Number(value.replace(/,/g, '')))
      .filter((value) => !Number.isNaN(value));

    return {
      text: text || 'لم يتم العثور على نص واضح في المستند.',
      amounts: amounts.slice(0, 50),
      pageCount,
      languageHints: ['ar', 'en'],
      usedFallback: false,
    };
  } catch (error) {
    console.error('Vision OCR failed, returning fallback insight', error);
    return fallbackInsight(buffer);
  }
}

export function isVisionReady() {
  return Boolean(visionClient);
}
