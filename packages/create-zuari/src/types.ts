export type ZuariTemplate = 'minimal' | 'spatial' | 'wasm' | 'tauri';

export interface ScaffoldOptions {
  projectName: string;
  template?: ZuariTemplate;
  targetDir?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}
