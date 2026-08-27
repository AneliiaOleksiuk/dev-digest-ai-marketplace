#!/usr/bin/env node
// Builds the data the UI in marketplace-ui/ reads at runtime:
//   marketplace-ui/public/data/search-index.json
//   marketplace-ui/public/data/changelog.json
//
// Walks plugins/** the same way validate-marketplace.mjs does and extracts
// searchable metadata. No dependencies — matches the rest of scripts/.
//
// If no plugins are registered yet (fresh marketplace), it falls back to
// the bundled sample data in marketplace-ui/src/data/ so the UI prototype still has
// something to show. Real plugin data always wins once any are registered.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");
const outDir = join(repoRoot, "marketplace-ui", "public", "data");
const sampleDir = join(repoRoot, "marketplace-ui", "src", "data");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function isDir(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

// Optional, per-plugin: plugins/<name>/evals/results/latest.json — a
// committed summary of manual/CLI eval runs (see plugins/sdd-workflow/evals/
// for the shape). Absent for any plugin that hasn't published one yet;
// the UI treats a missing `evals` field as "no eval data" and hides the tab.
function readEvalSummary(pluginDir) {
  const path = join(pluginDir, "evals", "results", "latest.json");
  if (!existsSync(path)) return null;
  try {
    return readJson(path);
  } catch (err) {
    console.warn(`Skipping malformed eval summary at ${relative(repoRoot, path)}: ${err.message}`);
    return null;
  }
}

function gitUpdatedAt(path) {
  try {
    const rel = relative(repoRoot, path);
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", rel], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

// Minimal frontmatter reader: only handles the flat "key: value" and
// "key: [a, b, c]" shapes actually used by SKILL.md/command/agent files —
// not a general YAML parser.
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { meta: {}, body: raw.trim() };
  const [, block, body] = match;
  const meta = {};
  for (const line of block.split("\n")) {
    const kv = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const [, key, rawValue] = kv;
    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      meta[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      meta[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }
  return { meta, body: body.trim() };
}

function firstParagraph(body) {
  const withoutHeadings = body.replace(/^#.*$/gm, "").trim();
  return withoutHeadings.split(/\n\s*\n/)[0]?.trim().slice(0, 240) || "";
}

function collectMarkdownArtifacts(dir, type) {
  if (!isDir(dir)) return [];
  const items = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let mdPath = null;
    let itemName = name.replace(/\.md$/, "");
    if (isDir(full)) {
      const nested = join(full, "SKILL.md");
      if (existsSync(nested)) mdPath = nested;
    } else if (name.endsWith(".md")) {
      mdPath = full;
    }
    if (!mdPath) continue;
    const { meta, body } = parseFrontmatter(readFileSync(mdPath, "utf8"));
    items.push({
      type,
      itemName,
      path: mdPath,
      title: meta.name || itemName,
      description: meta.description || meta.summary || firstParagraph(body),
      tags: meta.tags || [],
      invocation: meta.invocation || "",
      tools: meta.tools || [],
      body,
    });
  }
  return items;
}

function buildItemsForPlugin(pluginName, pluginDir, pluginJson, marketplaceName) {
  const installCommand = `claude plugin install ${pluginName}@${marketplaceName}`;
  const pluginTags = pluginJson.tags || [];
  const updatedAt = gitUpdatedAt(join(pluginDir, ".claude-plugin", "plugin.json"));

  const pluginItem = {
    id: pluginName,
    type: "plugin",
    plugin: pluginName,
    pluginVersion: pluginJson.version,
    name: pluginName,
    title: pluginJson.name,
    description: pluginJson.description,
    tags: pluginTags,
    author: pluginJson.author?.name || "",
    body: existsSync(join(pluginDir, "README.md")) ? readFileSync(join(pluginDir, "README.md"), "utf8") : "",
    updatedAt,
    installCommand,
    compatibility: pluginJson.compatibility || "",
    dependencies: pluginJson.dependencies || [],
    // One entry today (this plugin's current released version) — the shape
    // is an array so a richer multi-release history can be added later
    // (e.g. parsed from a per-plugin CHANGELOG.md) without a data migration.
    changelog: [{ version: pluginJson.version, date: updatedAt, summary: pluginJson.description }],
    evals: readEvalSummary(pluginDir),
  };

  const sub = [
    ...collectMarkdownArtifacts(join(pluginDir, "skills"), "skill"),
    ...collectMarkdownArtifacts(join(pluginDir, "commands"), "command"),
    ...collectMarkdownArtifacts(join(pluginDir, "agents"), "agent"),
  ].map((a) => ({
    id: `${pluginName}/${a.type}s/${a.itemName}`,
    type: a.type,
    plugin: pluginName,
    pluginVersion: pluginJson.version,
    name: a.itemName,
    title: a.title,
    description: a.description,
    tags: [...new Set([...pluginTags, ...a.tags])],
    author: pluginJson.author?.name || "",
    body: a.body,
    updatedAt: gitUpdatedAt(a.path),
    installCommand,
    invocation: a.invocation,
    tools: a.tools,
  }));

  return [pluginItem, ...sub];
}

function buildChangelog(items) {
  const entries = [];
  for (const item of items) {
    if (item.type !== "plugin") continue;
    for (const release of item.changelog || []) {
      entries.push({
        plugin: item.plugin,
        pluginTitle: item.title,
        version: release.version,
        date: release.date,
        summary: release.summary,
      });
    }
  }
  return entries.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function main() {
  const useSample = process.argv.includes("--sample");
  mkdirSync(outDir, { recursive: true });

  if (!existsSync(marketplacePath)) {
    console.error(`Missing ${marketplacePath}`);
    process.exit(1);
  }
  const marketplace = readJson(marketplacePath);

  // Source of truth is marketplace.json's plugins[], not the plugins/
  // folder listing — a directory that isn't registered there (WIP, or
  // removed via `renames`) must never show up in the public catalog.
  let items = [];
  let indexedCount = 0;
  for (const entry of marketplace.plugins || []) {
    if (typeof entry.source !== "string" || !entry.source.startsWith("./")) {
      console.log(`Skipping "${entry.name}" — only file-based (./plugins/...) sources are indexed.`);
      continue;
    }
    const pluginDir = join(repoRoot, entry.source);
    const pluginJsonPath = join(pluginDir, ".claude-plugin", "plugin.json");
    if (!existsSync(pluginJsonPath)) {
      console.log(`Skipping "${entry.name}" — no .claude-plugin/plugin.json at ${entry.source}.`);
      continue;
    }
    const pluginJson = readJson(pluginJsonPath);
    items.push(...buildItemsForPlugin(entry.name, pluginDir, pluginJson, marketplace.name));
    indexedCount += 1;
  }

  if (items.length === 0 && useSample) {
    items = readJson(join(sampleDir, "sample-index.json"));
    console.log(
      `No registered plugins found — using bundled SAMPLE data (${items.length} items) because ` +
        `--sample was passed. Never do this for a real deploy.`
    );
  }

  const changelog = buildChangelog(items);

  writeFileSync(join(outDir, "search-index.json"), `${JSON.stringify(items, null, 2)}\n`);
  writeFileSync(join(outDir, "changelog.json"), `${JSON.stringify(changelog, null, 2)}\n`);

  if (items.length === 0) {
    console.log(`No registered plugins yet — wrote an empty catalog to ${relative(repoRoot, outDir)}.`);
  } else if (!useSample) {
    console.log(`Indexed ${items.length} item(s) from ${indexedCount} plugin(s) into ${relative(repoRoot, outDir)}.`);
  }
}

main();
