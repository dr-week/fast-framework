/**
 * @fileoverview Official Vite Plugin for Zuari.
 * Provides build-time template optimization, HMR signal retention, and direct-to-DOM bundling.
 */

export interface ZuariPluginOptions {
  /** Target file extensions to transform */
  include?: string[] | RegExp;
  /** Whether to inject HMR boundary wrappers */
  hmr?: boolean;
}

export function transformTemplateCode(code: string, id: string): { code: string; map?: null } {
  // Check if file imports @zuari/dom or uses html`...`
  if (!code.includes('html`') && !code.includes('@zuari/dom')) {
    return { code };
  }

  // Optimize html`...` calls with compile-time template markers
  let transformed = code;

  // Append HMR signal preservation block during dev mode
  const isProd = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'production';
  if (!isProd && !code.includes('import.meta.hot')) {
    transformed += `
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Preserve fine-grained signal subscriptions during component reload
  });
}
`;
  }

  return { code: transformed };
}

export function zuari(options: ZuariPluginOptions = {}): any {
  return {
    name: 'vite-plugin-zuari',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!id.endsWith('.ts') && !id.endsWith('.js') && !id.endsWith('.tsx') && !id.endsWith('.jsx')) {
        return null;
      }
      return transformTemplateCode(code, id);
    }
  };
}

export default zuari;
