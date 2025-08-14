#!/usr/bin/env node
import { cmdApply, cmdClean, cmdDoctor, cmdInit, cmdList, printOverrideSafetyNotes } from './commands';
import { log } from './utils/log';

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
      '  ai-tree help    Show this message',
      '',
      'Tip: Run `ai-tree init` in a branch first. The tool avoids overwriting unchanged files and README mode is configurable.'
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

