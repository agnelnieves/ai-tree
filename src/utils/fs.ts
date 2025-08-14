import fs from 'fs';
import path from 'path';

export const projectRoot = process.cwd();
export type ExistingPolicy = 'skip' | 'backup' | 'overwrite';

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

export function writeJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function writeIfChanged(filePath: string, content: string | object): boolean {
  ensureDir(path.dirname(filePath));
  const exists = fs.existsSync(filePath);
  const prev = exists ? fs.readFileSync(filePath, 'utf8') : null;
  const next = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
  if (!exists || prev !== next) {
    fs.writeFileSync(filePath, next);
    return true;
  }
  return false;
}

export function removeIfExists(filePath: string): boolean {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
    return true;
  }
  return false;
}

export function writeWithPolicy(
  filePath: string,
  content: string | object,
  policy: ExistingPolicy,
  dryRun = false
): { changed: boolean; action: 'created' | 'updated' | 'skipped' | 'backed-up-and-updated' | 'none' } {
  ensureDir(path.dirname(filePath));
  const exists = fs.existsSync(filePath);
  const serialized = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
  if (!exists) {
    if (!dryRun) fs.writeFileSync(filePath, serialized);
    return { changed: true, action: 'created' };
  }

  const prev = fs.readFileSync(filePath, 'utf8');
  if (prev === serialized) return { changed: false, action: 'none' };

  if (policy === 'skip') return { changed: false, action: 'skipped' };

  if (policy === 'backup') {
    const backupPath = `${filePath}.bak`;
    if (!dryRun) {
      fs.writeFileSync(backupPath, prev);
      fs.writeFileSync(filePath, serialized);
    }
    return { changed: true, action: 'backed-up-and-updated' };
  }

  // overwrite
  if (!dryRun) fs.writeFileSync(filePath, serialized);
  return { changed: true, action: 'updated' };
}

