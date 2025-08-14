#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

type CentralConfig = {
  version: number;
  project: { name: string; description: string };
  rules: { global: string[]; coding: string[] };
  files: { README: boolean; AGENT: boolean; CONVENTIONS: boolean };
  mcpServers: {
    enableExamples: boolean;
    servers: Array<{ id: string; description?: string; command: string; args?: string[] }>;
  };
};

const log = {
  info: (msg: string) => console.log(msg),
  warn: (msg: string) => console.warn(msg),
  error: (msg: string) => console.error(msg)
};

const projectRoot = process.cwd();
const configDir = path.join(projectRoot, '.ai-tree');
const stateFile = path.join(configDir, 'state.json');
const centralConfigFile = path.join(projectRoot, 'ai-rules.json');

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

const defaultCentral: CentralConfig = {
  version: 1,
  project: {
    name: path.basename(projectRoot),
    description: 'AI assistants unified rules and MCP config.'
  },
  rules: {
    global: [
      'Be precise, cite file paths with backticks',
      'Prefer making edits over proposing pseudo-code',
      'Keep code style consistent with repo',
      'Never leak secrets'
    ],
    coding: [
      'Use meaningful variable names',
      'Add tests for public APIs when changed'
    ]
  },
  files: {
    README: true,
    AGENT: true,
    CONVENTIONS: true
  },
  mcpServers: {
    enableExamples: true,
    servers: [
      {
        id: 'repo-fs',
        description: 'Read-only repository file server',
        command: 'node',
        args: ['-e', 'console.log("mcp repo fs placeholder")']
      }
    ]
  }
};

function renderMarkdown(title: string, lines: string[]): string {
  return `# ${title}\n\n` + lines.map((l) => `- ${l}`).join('\n') + '\n';
}

function renderCopilotInstructions(central: CentralConfig): string {
  return [
    '# Copilot Instructions',
    '',
    'These reflect the centralized rules managed by ai-tree.',
    '',
    '## Global Rules',
    ...central.rules.global.map((r) => `- ${r}`),
    '',
    '## Coding Rules',
    ...central.rules.coding.map((r) => `- ${r}`)
  ].join('\n');
}

function renderWindsurfRules(central: CentralConfig): string {
  return [
    '# Windsurf Rules',
    ...central.rules.global.map((r) => `- ${r}`),
    '',
    '## Coding',
    ...central.rules.coding.map((r) => `- ${r}`)
  ].join('\n');
}

function renderMcpConfig(central: CentralConfig): unknown {
  return { mcpServers: central.mcpServers.servers };
}

function writeIfChanged(filePath: string, content: string | object): boolean {
  ensureDir(path.dirname(filePath));
  const exists = fs.existsSync(filePath);
  const prev = exists ? fs.readFileSync(filePath, 'utf8') : null;
  let next = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
  if (!exists || prev !== next) {
    fs.writeFileSync(filePath, next);
    return true;
  }
  return false;
}

function applyAll(central: CentralConfig): string[] {
  const changes: string[] = [];

  if (central.files.README)
    writeIfChanged(
      path.join(projectRoot, 'README.md'),
      renderMarkdown('AI Rules (centralized)', [
        'Managed by ai-tree CLI',
        'Run `ai-tree apply` after updates to ai-rules.json'
      ])
    ) && changes.push('README.md');

  if (central.files.AGENT)
    writeIfChanged(
      path.join(projectRoot, 'AGENT.md'),
      renderMarkdown('Agent Guidelines', central.rules.global)
    ) && changes.push('AGENT.md');

  if (central.files.CONVENTIONS)
    writeIfChanged(
      path.join(projectRoot, 'CONVENTIONS.md'),
      renderMarkdown('Code Conventions', central.rules.coding)
    ) && changes.push('CONVENTIONS.md');

  writeIfChanged(
    path.join(projectRoot, '.github', 'copilot-instructions.md'),
    renderCopilotInstructions(central)
  ) && changes.push('.github/copilot-instructions.md');

  writeIfChanged(
    path.join(projectRoot, '.cursor', 'rules', 'instructions.mdc'),
    '# Cursor Rules\n\n- Managed by ai-tree\n'
  ) && changes.push('.cursor/rules/instructions.mdc');
  writeIfChanged(
    path.join(projectRoot, '.cursor', 'mcp.json'),
    JSON.stringify(renderMcpConfig(central), null, 2)
  ) && changes.push('.cursor/mcp.json');

  writeIfChanged(
    path.join(projectRoot, '.windsurf', 'rules', 'instructions.md'),
    renderWindsurfRules(central)
  ) && changes.push('.windsurf/rules/instructions.md');
  writeIfChanged(
    path.join(projectRoot, '.codeium', 'windsurf', 'mcp_config.json'),
    JSON.stringify(renderMcpConfig(central), null, 2)
  ) && changes.push('.codeium/windsurf/mcp_config.json');

  writeIfChanged(
    path.join(projectRoot, '.kiro', 'steering', 'instructions.md'),
    renderMarkdown('Kiro Steering', central.rules.global)
  ) && changes.push('.kiro/steering/instructions.md');
  writeIfChanged(
    path.join(projectRoot, '.kiro', 'settings', 'mcp.json'),
    JSON.stringify(renderMcpConfig(central), null, 2)
  ) && changes.push('.kiro/settings/mcp.json');

  writeIfChanged(
    path.join(projectRoot, '.codex', 'config.toml'),
    ['# Managed by ai-tree', 'title = "Codex Config"', 'version = 1'].join('\n') + '\n'
  ) && changes.push('.codex/config.toml');

  writeIfChanged(
    path.join(projectRoot, '.vscode', 'mcp.json'),
    JSON.stringify(renderMcpConfig(central), null, 2)
  ) && changes.push('.vscode/mcp.json');

  writeIfChanged(
    path.join(projectRoot, '.zed', 'settings.json'),
    JSON.stringify({ mcp: renderMcpConfig(central) }, null, 2)
  ) && changes.push('.zed/settings.json');

  writeIfChanged(
    path.join(projectRoot, 'opencode.json'),
    JSON.stringify({ rules: central.rules }, null, 2)
  ) && changes.push('opencode.json');

  writeIfChanged(
    path.join(projectRoot, '.windsurfrules'),
    central.rules.global.concat(central.rules.coding).map((r) => `- ${r}`).join('\n') + '\n'
  ) && changes.push('.windsurfrules');

  return changes;
}

function cmdInit(): void {
  if (!fs.existsSync(centralConfigFile)) {
    writeJson(centralConfigFile, defaultCentral);
    log.info('Created ai-rules.json');
  } else {
    log.warn('ai-rules.json already exists');
  }
  ensureDir(configDir);
  writeJson(stateFile, { initializedAt: new Date().toISOString(), version: defaultCentral.version });
  const changed = applyAll(readJson<CentralConfig>(centralConfigFile, defaultCentral));
  log.info(`Applied templates (${changed.length} files).`);
}

function cmdApply(): void {
  const central = readJson<CentralConfig | null>(centralConfigFile, null);
  if (!central) {
    log.error('Missing ai-rules.json. Run `ai-tree init` first.');
    process.exit(1);
  }
  const changed = applyAll(central);
  if (changed.length === 0) log.info('No changes. Everything up to date.');
  else log.info(`Updated ${changed.length} files.`);
}

function cmdList(): void {
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

function cmdClean(): void {
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

function cmdDoctor(): void {
  const central = readJson<CentralConfig | null>(centralConfigFile, null);
  if (!central) {
    log.error('ai-rules.json is missing.');
    process.exit(1);
  }
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

function help(): void {
  log.info(
    [
      'ai-tree - Unified AI tooling config manager',
      '',
      'Usage:',
      '  ai-tree init    Initialize central config and write all templates',
      '  ai-tree apply   Regenerate tool configs from ai-rules.json',
      '  ai-tree list    Show files managed by this tool',
      '  ai-tree clean   Remove generated files',
      '  ai-tree doctor  Check expected directories',
      '  ai-tree help    Show this message'
    ].join('\n')
  );
}

const cmd = process.argv[2] || 'help';
switch (cmd) {
  case 'init':
    cmdInit();
    break;
  case 'apply':
    cmdApply();
    break;
  case 'list':
    cmdList();
    break;
  case 'clean':
    cmdClean();
    break;
  case 'doctor':
    cmdDoctor();
    break;
  default:
    help();
}

