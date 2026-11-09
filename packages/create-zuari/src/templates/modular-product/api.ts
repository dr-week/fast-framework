import type { GeneratedFile } from '../../types.js';

export function createProductApiFiles(): GeneratedFile[] {
const apiClient = `export type JsonParser<T> = (value: unknown) => T;

export interface ApiClient {
  get<T>(path: string, parse: JsonParser<T>): Promise<T>;
}

export function createApiClient(baseUrl = ''): ApiClient {
  return {
    async get<T>(path: string, parse: JsonParser<T>): Promise<T> {
      const response = await fetch(\`\${baseUrl}\${path}\`, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(\`GET \${path} failed with HTTP \${response.status}.\`);
      }

      const payload: unknown = await response.json();
      return parse(payload);
    }
  };
}
`;

const apiContract = `export interface OverviewItem {
  id: string;
  title: string;
  summary: string;
}

export function parseOverviewItems(value: unknown): OverviewItem[] {
  if (!Array.isArray(value)) {
    throw new TypeError('Expected the overview response to be an array.');
  }

  return value.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new TypeError(\`Overview item \${index} must be an object.\`);
    }

    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.title !== 'string' || typeof record.summary !== 'string') {
      throw new TypeError(\`Overview item \${index} has an invalid shape.\`);
    }

    return { id: record.id, title: record.title, summary: record.summary };
  });
}
`;

  return [
    { path: 'src/api/client.ts', content: apiClient },
    { path: 'src/api/contracts.ts', content: apiContract },
    { path: 'src/api/contracts.test.ts', content: `import { describe, expect, it } from 'vitest';
    import { parseOverviewItems } from './contracts.js';
    
    describe('parseOverviewItems', () => {
      it('accepts a valid API payload', () => {
        expect(parseOverviewItems([{ id: 'one', title: 'First', summary: 'A result' }])).toEqual([
          { id: 'one', title: 'First', summary: 'A result' }
        ]);
      });
    
      it('rejects malformed payloads instead of fabricating data', () => {
        expect(() => parseOverviewItems([{ id: 'one', title: 'First' }])).toThrow('invalid shape');
      });
    });
    ` }
  ];
}
