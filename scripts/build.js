import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import pkg from '../package.json' assert { type: 'json' };
const dir = fileURLToPath(new URL('.', import.meta.url));
const { version: currentVersion } = pkg;
console.log(`Current version: ${currentVersion}`);
const targetPath = resolve(resolve(dir, '..'), 'dist', 'index.html');
const target = readFileSync(targetPath, 'utf-8');
const targetNew = target.replaceAll('$VERSION$', currentVersion);
writeFileSync(targetPath, targetNew, 'utf-8');
if (target === targetNew) {
  console.log('Nothing changed.');
} else {
  console.log('Updated successfully.');
}
