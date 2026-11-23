/**
 * @fileoverview Portable Versioned JSON Snapshot Backup & Restore.
 */

export interface PortableSnapshot<T = Record<string, unknown>> {
  version: number;
  exportedAt: string;
  data: T;
}

/**
 * Serializes framework state (selector caches, memories, workflows) into a
 * versioned portable JSON string.
 */
export function serializeSnapshot<T>(data: T, version = 1): string {
  const payload: PortableSnapshot<T> = {
    version,
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Parses and validates a versioned portable JSON snapshot string.
 */
export function parseSnapshot<T>(jsonText: string, expectedVersion = 1): PortableSnapshot<T> {
  const parsed = JSON.parse(jsonText) as Partial<PortableSnapshot<T>>;
  if (!parsed || typeof parsed !== 'object' || !('data' in parsed)) {
    throw new Error('Invalid snapshot payload: missing data field.');
  }
  const version = typeof parsed.version === 'number' ? parsed.version : 1;
  if (version !== expectedVersion) {
    throw new Error(`Unsupported snapshot version ${version} (expected ${expectedVersion}).`);
  }
  return {
    version,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
    data: parsed.data as T,
  };
}
