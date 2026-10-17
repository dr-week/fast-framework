import { describe, it, expect } from 'vitest';
import { transformTemplateCode } from './index.js';

describe('@zuari/vite-plugin', () => {
  it('leaves non-Zuari files untouched', () => {
    const raw = 'const x = 42;';
    const result = transformTemplateCode(raw, 'test.ts');
    expect(result.code).toBe(raw);
  });

  it('injects HMR boundary and processes html templates', () => {
    const raw = `
      import { html } from '@zuari/dom';
      export const card = html\`<div>Hello</div>\`;
    `;
    const result = transformTemplateCode(raw, 'component.ts');
    expect(result.code).toContain('import.meta.hot');
  });
});
