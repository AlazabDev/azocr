export type Item = {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  category: string;
};

export type CompanyOffer = {
  company: string;
  total: number;
  score: number;
  highlights: string[];
};

export type DashboardMetric = {
  label: string;
  value: string;
  trend: number;
  variant?: 'positive' | 'negative';
};

export type UploadResult = {
  fileName: string;
  size: number;
  type: string;
  extractedText: string;
  numericFields: number[];
  normalizedItems: Item[];
};

export type OcrInsight = {
  text: string;
  amounts: number[];
  pageCount: number;
  languageHints: string[];
  usedFallback: boolean;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
};
