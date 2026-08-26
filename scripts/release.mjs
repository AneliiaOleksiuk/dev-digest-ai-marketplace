#!/usr/bin/env node
// Automates the "Update" steps in docs/RELEASES.md: bump a plugin's version
// (wherever it currently lives — plugin.json XOR the marketplace entry),
// then run the same validator CI runs. No dependencies, matches the style
// of scripts/validate-marketplace.mjs.
//
// Usage:
//   node scripts/release.mjs <plugin-name> <patch|minor|major|X.Y.Z>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function bumpVersion(current, bump) {
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump;
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!m) fail(`current version "${current}" is not valid SemVer, pass an explicit X.Y.Z instead`);
  let [, major, minor, patch] = m.map(Number);
  if (bump === "major") { major += 1; minor = 0; patch = 0; }
  else if (bump === "minor") { minor += 1; patch = 0; }
  else if (bump === "patch") { patch += 1; }
  else fail(`bump must be "patch", "minor", "major", or an explicit X.Y.Z — got "${bump}"`);
  return `${major}.${minor}.${patch}`;
}

const [pluginName, bump] = process.argv.slice(2);
if (!pluginName || !bump) {
  console.error("Usage: node scripts/release.mjs <plugin-name> <patch|minor|major|X.Y.Z>");
  process.exit(1);
}

if (!existsSync(marketplacePath)) fail(`missing ${marketplacePath}`);
const marketplace = readJson(marketplacePath);
const entryIndex = (marketplace.plugins || []).findIndex((p) => p.name === pluginName);
if (entryIndex === -1) fail(`"${pluginName}" is not registered in marketplace.json plugins[]`);
const entry = marketplace.plugins[entryIndex];

const pluginJsonPath =
  typeof entry.source === "string" && entry.source.startsWith("./")
    ? join(repoRoot, entry.source, ".claude-plugin", "plugin.json")
    : null;

const hasPluginJson = pluginJsonPath && existsSync(pluginJsonPath);
const pluginJson = hasPluginJson ? readJson(pluginJsonPath) : null;

const versionInPluginJson = hasPluginJson && typeof pluginJson.version === "string";
const versionInMarketplace = typeof entry.version === "string";

if (versionInPluginJson && versionInMarketplace) {
  fail(
    `"${pluginName}" has a version in both plugin.json and marketplace.json — ` +
      `docs/RELEASES.md requires exactly one location. Remove one before releasing.`
  );
}
if (!versionInPluginJson && !versionInMarketplace) {
  fail(`"${pluginName}" has no "version" field in plugin.json or marketplace.json — add one first.`);
}

const currentVersion = versionInPluginJson ? pluginJson.version : entry.version;
const nextVersion = bumpVersion(currentVersion, bump);

if (versionInPluginJson) {
  pluginJson.version = nextVersion;
  writeJson(pluginJsonPath, pluginJson);
} else {
  entry.version = nextVersion;
  writeJson(marketplacePath, marketplace);
}

console.log(`${pluginName}: ${currentVersion} -> ${nextVersion}`);
console.log(`  updated: ${versionInPluginJson ? pluginJsonPath : marketplacePath}`);

console.log("\nRunning scripts/validate-marketplace.mjs...");
try {
  execFileSync(process.execPath, [join(repoRoot, "scripts", "validate-marketplace.mjs")], {
    cwd: repoRoot,
    stdio: "inherit",
  });
} catch {
  fail("validation failed after the version bump — fix the issue above before opening a PR.");
}

console.log(
  "\nNext steps:\n" +
    "  1. Review the diff (git diff).\n" +
    "  2. Commit and open a PR using .github/pull_request_template.md.\n" +
    "  3. If this plugin also has a UI catalog entry, the site's search index\n" +
    "     is regenerated automatically on merge — no manual step needed."
);
