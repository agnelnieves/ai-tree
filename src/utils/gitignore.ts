import fs from 'fs';
import path from 'path';
import { projectRoot, writeIfChanged } from './fs';

const START = '# ai-tree managed ignores — start';
const END = '# ai-tree managed ignores — end';

export function syncGitignore(entries: string[]): boolean {
  const giPath = path.join(projectRoot, '.gitignore');
  const existing = fs.existsSync(giPath) ? fs.readFileSync(giPath, 'utf8') : '';

  const block = [START, ...entries, END, ''].join('\n');

  let next: string;
  if (existing.includes(START) && existing.includes(END)) {
    const pattern = new RegExp(`${START}[\s\S]*?${END}\n?`, 'm');
    next = existing.replace(pattern, block);
  } else {
    const sep = existing.length > 0 && !existing.endsWith('\n') ? '\n\n' : '\n';
    next = existing + sep + block;
  }

  if (next === existing) return false;
  return writeIfChanged(giPath, next);
}

