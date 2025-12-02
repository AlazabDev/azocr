import { Client } from '@elastic/elasticsearch';
import { Item } from '../types';
import { sampleItems } from './sampleData';

const searchUrl = process.env.ELASTICSEARCH_URL;
const searchIndex = process.env.ELASTICSEARCH_INDEX || 'azocr-items';
const searchApiKey = process.env.ELASTICSEARCH_API_KEY;

function buildSearchClient() {
  if (!searchUrl) return null;
  try {
    const client = new Client({
      node: searchUrl,
      auth: searchApiKey ? { apiKey: searchApiKey } : undefined,
    });
    return client;
  } catch (error) {
    console.error('Failed to initialize Elasticsearch client', error);
    return null;
  }
}

const searchClient = buildSearchClient();

export function isSearchConfigured() {
  return Boolean(searchClient);
}

export async function indexItems(items: Item[]) {
  if (!searchClient) {
    return { indexed: 0, usedFallback: true };
  }

  const operations = items.flatMap((item) => [{ index: { _index: searchIndex, _id: item.id } }, item]);
  await searchClient.bulk({ body: operations });
  return { indexed: items.length, usedFallback: false };
}

export async function searchItems(term: string): Promise<{ items: Item[]; usedFallback: boolean }> {
  const normalized = term.trim();

  if (!searchClient) {
    const filtered = sampleItems.filter((item) =>
      item.description.toLowerCase().includes(normalized.toLowerCase()) ||
      item.category.toLowerCase().includes(normalized.toLowerCase()) ||
      item.id.toLowerCase().includes(normalized.toLowerCase())
    );
    return { items: filtered.slice(0, 10), usedFallback: true };
  }

  const response = await searchClient.search<Item>({
    index: searchIndex,
    query: {
      multi_match: {
        query: normalized,
        fields: ['description^3', 'category', 'id'],
        fuzziness: 'AUTO',
      },
    },
    size: 15,
  });

  const hits = response.hits?.hits ?? [];

  const items = hits
    .map((hit) => hit._source)
    .filter((item): item is Item => Boolean(item))
    .map((item) => ({ ...item, description: `${item.description} (ElasticSearch)` }));

  return { items, usedFallback: false };
}
