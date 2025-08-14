import fs from 'fs';
import path from 'path';

export const projectRoot = process.cwd();

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

