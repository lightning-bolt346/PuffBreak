import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const cacheDirs = ['.next', '.next-dev'];

for (const dir of cacheDirs) {
  const target = resolve(projectRoot, dir);
  if (!target.startsWith(`${projectRoot}\\`) && !target.startsWith(`${projectRoot}/`)) {
    throw new Error(`Refusing to remove cache outside the project: ${target}`);
  }
  await rm(target, { recursive: true, force: true });
  console.log(`Cleared ${dir}`);
}
