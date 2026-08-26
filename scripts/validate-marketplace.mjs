#!/usr/bin/env node
// Structural linter for .claude-plugin/marketplace.json. No dependencies.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");

const errors = [];
const warn = (msg) => errors.push(msg);

if (!existsSync(marketplacePath)) {
  console.error(`Missing ${marketplacePath}`);
  process.exit(1);
}

let marketplace;
try {
  marketplace = JSON.parse(readFileSync(marketplacePath, "utf8"));
} catch (e) {
  console.error(`Invalid JSON in marketplace.json: ${e.message}`);
  process.exit(1);
}

const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;

if (!marketplace.name || !kebab.test(marketplace.name)) {
  warn(`marketplace.name must be kebab-case, got: ${JSON.stringify(marketplace.name)}`);
}
if (!marketplace.owner || !marketplace.owner.name) {
  warn("marketplace.owner.name is required");
}
if (!Array.isArray(marketplace.plugins)) {
  warn("marketplace.plugins must be an array");
}

const seenNames = new Set();
for (const [i, plugin] of (marketplace.plugins || []).entries()) {
  const label = `plugins[${i}]`;
  if (!plugin.name || !kebab.test(plugin.name)) {
    warn(`${label}.name must be kebab-case, got: ${JSON.stringify(plugin.name)}`);
  } else if (seenNames.has(plugin.name)) {
    warn(`${label}.name "${plugin.name}" is a duplicate`);
  } else {
    seenNames.add(plugin.name);
  }

  if (!plugin.source) {
    warn(`${label}.source is required`);
    continue;
  }

  if (typeof plugin.source === "string") {
    if (!plugin.source.startsWith("./")) {
      warn(`${label}.source relative paths must start with "./"`);
    }
    const pluginDir = join(repoRoot, plugin.source);
    if (!existsSync(pluginDir)) {
      warn(`${label}.source path does not exist: ${plugin.source}`);
    } else if (!existsSync(join(pluginDir, ".claude-plugin", "plugin.json"))) {
      warn(`${label}.source missing .claude-plugin/plugin.json: ${plugin.source}`);
    }
  } else if (typeof plugin.source === "object") {
    const validSourceTypes = ["github", "url", "git-subdir", "npm", "archive", "command"];
    if (!validSourceTypes.includes(plugin.source.source)) {
      warn(`${label}.source.source must be one of ${validSourceTypes.join(", ")}`);
    }
  } else {
    warn(`${label}.source must be a string or object`);
  }
}

if (errors.length > 0) {
  console.error(`Found ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`OK: ${(marketplace.plugins || []).length} plugin(s) validated.`);
