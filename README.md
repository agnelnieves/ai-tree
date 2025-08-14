# ai-tree

Unified CLI to manage AI editor rules and MCP configs from a single source of truth. It generates and keeps in sync config files for Cursor, Windsurf, Copilot, Kiro, Codeium, Codex, VSCode, Zed, and OpenCode.

## Why
- **Single file to edit**: Update `ai-rules.json` and sync everywhere.
- **Repeatable**: Idempotent `apply` regenerates the same outputs.
- **Portable**: Zero runtime deps; tiny TypeScript CLI.

## Install
Until this is published to npm, clone the repo locally:

```bash
npm i
npm run build
```

When published, you’ll be able to run:

```bash
npx ai-tree --help
```

## Quickstart
```bash
# 1) Initialize central config and scaffold all tool files
npx ai-tree init

# 2) Edit the single source of truth
$EDITOR ai-rules.json

# 3) Re-apply changes everywhere
npx ai-tree apply
```

## Commands
- **init**: Create `ai-rules.json` (if missing) and generate all outputs.
- **apply**: Regenerate tool configs from `ai-rules.json`.
- **list**: Show files managed by this tool.
- **clean**: Remove generated files.
- **doctor**: Check expected directories and basic health.

Run `npx ai-tree help` to see usage.

## Configuration
All behavior is driven by `ai-rules.json`:

```json
{
  "version": 1,
  "project": { "name": "my-repo", "description": "AI assistants unified rules" },
  "rules": {
    "global": ["Be precise"],
    "coding": ["Use meaningful names"]
  },
  "files": { "README": true, "AGENT": true, "CONVENTIONS": true },
  "mcpServers": {
    "enableExamples": true,
    "servers": [
      { "id": "repo-fs", "command": "node", "args": ["-e", "console.log('placeholder')"] }
    ]
  }
}
```

## What gets generated
Examples (depending on your config):
- `.github/copilot-instructions.md`
- `.cursor/rules/instructions.mdc`, `.cursor/mcp.json`
- `.windsurf/rules/instructions.md`, `.codeium/windsurf/mcp_config.json`
- `.kiro/steering/instructions.md`, `.kiro/settings/mcp.json`
- `.codex/config.toml`, `.vscode/mcp.json`, `.zed/settings.json`
- `.windsurfrules`, `opencode.json`, `AGENT.md`, `CONVENTIONS.md`

All of these are safe to delete and re-generate with `ai-tree apply`.

## Contributing
Thanks for helping improve ai-tree! A few quick guidelines:

1. **Prereqs**: Node >= 16.14
2. **Setup**:
   - `npm i`
   - `npm run build`
   - Run locally via `node dist/cli.js <command>`
3. **Branching**: use short, descriptive branches like `feat/windsurf-sync` or `fix/mcp-json`.
4. **Commits**: follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`...).
5. **Style**: TypeScript, strict mode. Prefer clear names and early returns.
6. **Testing**: if you add or change generators, include a small repo fixture or sample to exercise it manually.
7. **PRs**: keep them focused and include a short description of the change and any migration notes.

## License
MIT
