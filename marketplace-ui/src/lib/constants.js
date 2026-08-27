// Mirrors .claude-plugin/marketplace.json "name" — update both if the
// marketplace is ever renamed.
export const MARKETPLACE_NAME = "dev-digest-ai-marketplace";

// Short label shown in the header pill next to the "Catalog" wordmark.
export const MARKETPLACE_SHORT_NAME = "dev-digest";

// Mirrors the repo's own git remote — update if the repo is ever transferred.
export const REPO_URL = "https://github.com/AneliiaOleksiuk/dev-digest-ai-marketplace";

export const KINDS = ["plugin", "skill", "agent", "command", "hook", "mcp"];

// Home's stats row omits "hook" — matches the design draft, which only
// tiles the five kinds a user would search for directly.
export const STATS_KINDS = ["plugin", "skill", "agent", "command", "mcp"];

export const KIND_LABEL = {
  plugin: "plugins",
  skill: "skills",
  agent: "agents",
  command: "commands",
  hook: "hooks",
  mcp: "MCP",
};

export const KIND_LABEL_SINGULAR = {
  plugin: "plugin",
  skill: "skill",
  agent: "agent",
  command: "command",
  hook: "hook",
  mcp: "MCP",
};
