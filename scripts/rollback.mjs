#!/usr/bin/env node
// Automates the two rollback paths in docs/RELEASES.md and docs/SECURITY.md
// ("After a dangerous release"). No dependencies, matches the style of
// scripts/validate-marketplace.mjs.
//
// Usage:
//   node scripts/rollback.mjs history <plugin-name>
//   node scripts/rollback.mjs revert <plugin-name> [--yes]
//   node scripts/rollback.mjs disable <plugin-name>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
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

function git(args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" });
}

function findVersionFile(pluginName) {
  if (!existsSync(marketplacePath)) fail(`missing ${marketplacePath}`);
  const marketplace = readJson(marketplacePath);
  const entry = (marketplace.plugins || []).find((p) => p.name === pluginName);
  if (!entry) fail(`"${pluginName}" is not registered in marketplace.json plugins[]`);

  const pluginJsonPath =
    typeof entry.source === "string" && entry.source.startsWith("./")
      ? join(repoRoot, entry.source, ".claude-plugin", "plugin.json")
      : null;

  if (pluginJsonPath && existsSync(pluginJsonPath) && typeof readJson(pluginJsonPath).version === "string") {
    return pluginJsonPath;
  }
  if (typeof entry.version === "string") return marketplacePath;
  fail(`"${pluginName}" has no version field to trace in either plugin.json or marketplace.json`);
}

function commitsTouching(path) {
  const relPath = relative(repoRoot, path);
  const log = git(["log", "--format=%H|%cI|%s", "--", relPath]).trim();
  if (!log) return [];
  return log.split("\n").map((line) => {
    const [sha, date, subject] = line.split("|");
    return { sha, date, subject };
  });
}

const [cmd, pluginName, flag] = process.argv.slice(2);

if (cmd === "history") {
  if (!pluginName) fail("Usage: node scripts/rollback.mjs history <plugin-name>");
  const file = findVersionFile(pluginName);
  const commits = commitsTouching(file);
  if (commits.length === 0) {
    console.log(`No commit history found for ${relative(repoRoot, file)}.`);
  } else {
    console.log(`Commits touching ${relative(repoRoot, file)} (newest first):\n`);
    for (const c of commits) console.log(`  ${c.sha.slice(0, 10)}  ${c.date}  ${c.subject}`);
  }
} else if (cmd === "revert") {
  if (!pluginName) fail("Usage: node scripts/rollback.mjs revert <plugin-name> [--yes]");
  const file = findVersionFile(pluginName);
  const commits = commitsTouching(file);
  if (commits.length === 0) fail(`no commit history found for ${relative(repoRoot, file)}`);
  const [latest] = commits;
  console.log(`Most recent change to ${relative(repoRoot, file)}:`);
  console.log(`  ${latest.sha.slice(0, 10)}  ${latest.date}  ${latest.subject}\n`);

  if (flag === "--yes") {
    console.log(`Reverting ${latest.sha.slice(0, 10)} (staged, not committed)...`);
    try {
      git(["revert", "--no-commit", latest.sha]);
    } catch (e) {
      fail(`git revert failed — resolve conflicts manually, or abort with "git revert --abort".\n${e.message}`);
    }
    console.log("\nReview the staged changes, then commit yourself:\n  git status\n  git commit");
  } else {
    console.log(
      `Dry run — nothing changed. To actually revert this commit, run:\n` +
        `  node scripts/rollback.mjs revert ${pluginName} --yes\n\n` +
        `Or do it manually:\n  git revert --no-commit ${latest.sha}`
    );
  }
} else if (cmd === "disable") {
  if (!pluginName) fail("Usage: node scripts/rollback.mjs disable <plugin-name>");
  const marketplace = readJson(marketplacePath);
  const index = (marketplace.plugins || []).findIndex((p) => p.name === pluginName);
  if (index === -1) fail(`"${pluginName}" is not registered in marketplace.json plugins[]`);

  marketplace.plugins.splice(index, 1);
  marketplace.renames = marketplace.renames || {};
  marketplace.renames[pluginName] = null;
  writeJson(marketplacePath, marketplace);

  console.log(`Removed "${pluginName}" from plugins[] and added renames["${pluginName}"] = null.`);
  console.log(
    "This makes the plugin un-installable immediately once merged (SECURITY.md — " +
      '"After a dangerous release", step 3). Commit and open a PR; if a secret was ' +
      "exposed, rotate it first — this script does not do that."
  );
} else {
  console.error(
    "Usage:\n" +
      "  node scripts/rollback.mjs history <plugin-name>\n" +
      "  node scripts/rollback.mjs revert <plugin-name> [--yes]\n" +
      "  node scripts/rollback.mjs disable <plugin-name>"
  );
  process.exit(1);
}
