/** @fileoverview Template registry for the create-zuari scaffolder. */
import type { GeneratedFile, ZuariTemplate } from './types.js';
import { createKotlinAndroidFiles } from './templates/kotlin-android.js';
import { createModularProductFiles } from './templates/modular-product.js';
import { createSpatialWebxrFiles } from './templates/spatial-webxr.js';
import { createTauriDesktopFiles } from './templates/tauri-desktop.js';
import { createVanillaTsFiles } from './templates/vanilla.js';

type TemplateName = 'vanilla-ts' | 'tauri-desktop' | 'spatial-webxr' | 'kotlin-android' | 'modular-product';

const templateBuilders = {
  'vanilla-ts': createVanillaTsFiles,
  'tauri-desktop': createTauriDesktopFiles,
  'spatial-webxr': createSpatialWebxrFiles,
  'kotlin-android': createKotlinAndroidFiles,
  'modular-product': createModularProductFiles
} satisfies Record<TemplateName, (projectName: string) => GeneratedFile[]>;

export function getTemplateFiles(projectName: string, rawTemplate: ZuariTemplate = 'vanilla-ts'): GeneratedFile[] {
  return templateBuilders[normalizeTemplate(rawTemplate)](projectName);
}

function normalizeTemplate(template: ZuariTemplate): TemplateName {
  if (template === 'tauri' || template === 'tauri-desktop') return 'tauri-desktop';
  if (template === 'spatial' || template === 'spatial-webxr') return 'spatial-webxr';
  if (template === 'kotlin-android') return 'kotlin-android';
  if (template === 'modular-product') return 'modular-product';
  return 'vanilla-ts';
}

export * from './types.js';
