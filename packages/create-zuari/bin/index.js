#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getTemplateFiles } from '../dist/index.js';

const args = process.argv.slice(2);

let projectName = 'zuari-app';
let template = 'vanilla-ts';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--template' || arg === '-t') {
    template = args[i + 1] || 'vanilla-ts';
    i++;
  } else if (!arg.startsWith('-')) {
    projectName = arg;
  }
}

const targetDir = path.resolve(process.cwd(), projectName);

console.log(`\n🌊 Scaffolding Zuari project [${projectName}] with template [${template}] in ${targetDir}...\n`);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = getTemplateFiles(projectName, template);

for (const file of files) {
  const filePath = path.join(targetDir, file.path);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, file.content, 'utf-8');
  console.log(`  ✓ Created ${file.path}`);
}

console.log(`\n🎉 Success! Run the following commands to get started:\n`);
console.log(`  cd ${projectName}`);
console.log(`  pnpm install`);
console.log(`  pnpm dev\n`);
