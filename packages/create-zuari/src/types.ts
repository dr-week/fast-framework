export type ZuariTemplate =
  | 'vanilla-ts'
  | 'minimal'
  | 'tauri-desktop'
  | 'tauri'
  | 'spatial-webxr'
  | 'spatial'
  | 'kotlin-android'
  | 'wasm';

export interface ScaffoldOptions {
  projectName: string;
  template?: ZuariTemplate;
  targetDir?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}
