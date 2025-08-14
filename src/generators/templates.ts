import path from 'path';
import { CentralConfig } from '../types';
import { projectRoot } from '../utils/fs';

export const defaultCentral = (): CentralConfig => ({
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
  files: { README: true, AGENT: true, CONVENTIONS: true },
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
});

export function renderMarkdown(title: string, lines: string[]): string {
  return `# ${title}\n\n` + lines.map((l) => `- ${l}`).join('\n') + '\n';
}

export function renderCopilotInstructions(central: CentralConfig): string {
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

export function renderWindsurfRules(central: CentralConfig): string {
  return [
    '# Windsurf Rules',
    ...central.rules.global.map((r) => `- ${r}`),
    '',
    '## Coding',
    ...central.rules.coding.map((r) => `- ${r}`)
  ].join('\n');
}

export function renderMcpConfig(central: CentralConfig): unknown {
  return { mcpServers: central.mcpServers.servers };
}

