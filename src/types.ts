export type McpServer = {
  id: string;
  description?: string;
  command: string;
  args?: string[];
};

// Prevents accidental overwrites of an existing project README by letting users choose to append, overwrite, or skip.
export type ReadmeMode = boolean | 'append' | 'overwrite' | 'skip';

export type CentralConfig = {
  version: number;
  project: { name: string; description: string };
  rules: { global: string[]; coding: string[] };
  files: { README: ReadmeMode; AGENT: boolean; CONVENTIONS: boolean };
  mcpServers: {
    enableExamples: boolean;
    servers: McpServer[];
  };
};

