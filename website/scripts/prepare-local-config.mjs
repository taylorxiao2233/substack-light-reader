import { constants, copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../.openai/', import.meta.url));
const source = fileURLToPath(new URL('../.openai/hosting.example.json', import.meta.url));
const target = fileURLToPath(new URL('../.openai/hosting.json', import.meta.url));

mkdirSync(directory, { recursive: true });
try {
  // A public clone needs a local configuration, not the maintainer's deployment ID.
  copyFileSync(source, target, constants.COPYFILE_EXCL);
  console.log('Created local website configuration from hosting.example.json.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
