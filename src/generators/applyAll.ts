import path from 'path';
import { CentralConfig } from '../types';
import { projectRoot, writeIfChanged } from '../utils/fs';
import { renderCopilotInstructions, renderMarkdown, renderMcpConfig, renderWindsurfRules } from './templates';

export function applyAll(central: CentralConfig): string[] {
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

