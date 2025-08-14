import path from 'path';
import { CentralConfig } from '../types';
import { projectRoot, readJson, writeJson } from '../utils/fs';
import { log } from '../utils/log';
import { applyAll } from '../generators/applyAll';
import { defaultCentral } from '../generators/templates';

const configDir = path.join(projectRoot, '.ai-tree');
const stateFile = path.join(configDir, 'state.json');
export const centralConfigFile = path.join(projectRoot, 'ai-rules.json');

export function cmdInit(): void {
  if (!require('fs').existsSync(centralConfigFile)) {
    writeJson(centralConfigFile, defaultCentral());
    log.info('Created ai-rules.json');
  } else {
    log.warn('ai-rules.json already exists');
  }
  require('fs').mkdirSync(configDir, { recursive: true });
  writeJson(stateFile, { initializedAt: new Date().toISOString(), version: 1 });
  const changed = applyAll(readJson<CentralConfig>(centralConfigFile, defaultCentral()));
  log.info(`Applied templates (${changed.length} files).`);
}

export function cmdApply(): void {
  const central = readJson<CentralConfig | null>(centralConfigFile, null);
  if (!central) {
    log.error('Missing ai-rules.json. Run `ai-tree init` first.');
    process.exit(1);
  }
  const changed = applyAll(central);
  if (changed.length === 0) log.info('No changes. Everything up to date.');
  else log.info(`Updated ${changed.length} files.`);
}

export function cmdList(): void {
  const outputs = [
    '.github/copilot-instructions.md',
    '.cursor/rules/instructions.mdc',
    '.cursor/mcp.json',
    '.windsurf/rules/instructions.md',
    '.codeium/windsurf/mcp_config.json',
    '.kiro/steering/instructions.md',
    '.kiro/settings/mcp.json',
    '.codex/config.toml',
    '.vscode/mcp.json',
    '.zed/settings.json',
    '.windsurfrules',
    'opencode.json',
    'AGENT.md',
    'CONVENTIONS.md',
    'README.md'
  ];
  outputs.forEach((f) => log.info(f));
}

export function cmdClean(): void {
  const fs = require('fs');
  const files = [
    '.github/copilot-instructions.md',
    '.cursor/rules/instructions.mdc',
    '.cursor/mcp.json',
    '.windsurf/rules/instructions.md',
    '.codeium/windsurf/mcp_config.json',
    '.kiro/steering/instructions.md',
    '.kiro/settings/mcp.json',
    '.codex/config.toml',
    '.vscode/mcp.json',
    '.zed/settings.json',
    '.windsurfrules',
    'opencode.json',
    'AGENT.md',
    'CONVENTIONS.md'
  ];
  let removed = 0;
  for (const rel of files) {
    const fp = path.join(projectRoot, rel);
    if (fs.existsSync(fp)) {
      fs.rmSync(fp, { force: true });
      removed++;
    }
  }
  log.info(`Removed ${removed} files.`);
}

export function cmdDoctor(): void {
  const fs = require('fs');
  const required = [
    '.github',
    '.cursor/rules',
    '.windsurf/rules',
    '.codeium/windsurf',
    '.kiro/steering',
    '.kiro/settings',
    '.codex',
    '.vscode',
    '.zed'
  ];
  const report = required.map((dir) => ({ dir, exists: fs.existsSync(path.join(projectRoot, dir)) }));
  report.forEach((r) => log.info(`${r.exists ? 'OK ' : 'MISS '} ${r.dir}`));
}

