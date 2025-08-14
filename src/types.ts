export type McpServer = {
  id: string;
  description?: string;
  command: string;
  args?: string[];
};

export type CentralConfig = {
  version: number;
  project: { name: string; description: string };
  rules: { global: string[]; coding: string[] };
  files: { README: boolean; AGENT: boolean; CONVENTIONS: boolean };
  mcpServers: {
    enableExamples: boolean;
    servers: McpServer[];
  };
};

