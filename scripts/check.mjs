import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
function files(directory) {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? files(path) : [path];
  });
}
for (const path of ['src', 'scripts', 'tests', 'extension', 'userscript'].flatMap(files).filter((path) => /\.(m?js)$/.test(path))) {
  execFileSync(process.execPath, ['--check', join(root, path)], { stdio: 'pipe' });
}
const manifest = JSON.parse(readFileSync(join(root, 'extension/manifest.json'), 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.permissions, ['storage']);
for (const path of [manifest.action.default_popup, ...manifest.content_scripts[0].js, ...manifest.content_scripts[0].css, ...Object.values(manifest.icons)]) {
  assert(readFileSync(join(root, 'extension', path)).length > 0, `Empty manifest asset: ${path}`);
}
execFileSync(process.execPath, [join(root, 'scripts/build.mjs'), '--check'], { stdio: 'inherit' });
console.log('Syntax, manifest assets and generated files verified.');
