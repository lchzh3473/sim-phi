import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import c from 'picocolors';
import prompts from 'prompts';
import meta from './meta.json' assert { type: 'json' };
const dir = fileURLToPath(new URL('.', import.meta.url));
const { version: currentVersion } = meta;
const valid = v => /^\d+\.\d+\.\d+(\.b\d+)?$/.test(v);
const vi = ['beta', 'release', 'patch', 'minor', 'major'];
const inc = i => {
  const [major, minor, patch, beta] = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)(?:\.b(\d+))?$/).slice(1).map(Number);
  switch (i) {
    case 'beta':
      return `${major}.${minor}.${patch + (beta ? 0 : 1)}.b${(beta | 0) + 1}`;
    case 'release':
      return `${major}.${minor}.${patch + (beta ? 0 : 1)}`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}.b1`;
    case 'minor':
      return `${major}.${minor + 1}.0.b1`;
    case 'major':
      return `${major + 1}.0.0.b1`;
    default:
      return null;
  }
};
const step = msg => console.log(c.cyan(msg));
async function main() {
  let targetVersion = null;
  const versions = vi.map(i => `${i} (${inc(i)})`).concat(['custom']);
  console.log(`Current version: ${c.yellow(currentVersion)}`);
  console.log(vi.map(i => `${i} (${inc(i)})`));
  const { update } = await prompts({
    type: 'select',
    name: 'update',
    message: 'Select update type',
    choices: versions
  });
  if (update === versions.length - 1) {
    targetVersion = (await prompts({
      type: 'text',
      name: 'version',
      message: 'Input custom version',
      initial: currentVersion
    })).version;
  } else {
    targetVersion = versions[update].match(/\((.*)\)/)[1];
  }
  if (!valid(targetVersion)) {
    throw new Error(`Invalid target version: ${targetVersion}`);
  }
  const date = new Date();
  const { yes: tagOk } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion} on ${date.toISOString()}. Confirm?`
  });
  if (!tagOk) {
    console.log('Update cancelled.');
    return;
  }
  // Update the package version.
  step('\nUpdating the package version...');
  updatePackage(targetVersion);
  updateMeta(targetVersion, date);
}
function updatePackage(version) {
  const pkgPath = resolve(resolve(dir, '..'), 'package.json');
  const pkgNew = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkgNew.version = version;
  writeFileSync(pkgPath, `${JSON.stringify(pkgNew, null, 2)}\n`);
}
function updateMeta(version, date = new Date()) {
  const metaPath = resolve(resolve(dir, '..'), 'scripts', 'meta.json');
  const metaNew = JSON.parse(readFileSync(metaPath, 'utf-8'));
  metaNew.version = version;
  metaNew.lastupdate = Math.floor(date.getTime() / 1e3);
  writeFileSync(metaPath, `${JSON.stringify(metaNew, null, 2)}\n`);
}
main();
