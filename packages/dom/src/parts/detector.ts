/**
 * Feature-detects whether the host browser engine supports the emerging W3C DOM Parts API.
 * Currently progressing in Chromium experimental and WebKit standards track.
 */
export function hasNativeDOMParts(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Part' in window &&
    'ChildNodePart' in window &&
    typeof (window as unknown as { getParts?: unknown }).getParts === 'function'
  );
}
