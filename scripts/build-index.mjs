#!/usr/bin/env node
// Builds the data the UI in site/ reads at runtime:
//   site/public/data/search-index.json
//   site/public/data/changelog.json
//
// Walks plugins/** the same way validate-marketplace.mjs does, extracts
// searchable metadata, and computes "related" items (build-time, so the
// client never has to). No dependencies — matches the rest of scripts/.
//
// If no plugins are registered yet (fresh marketplace), it falls back to
// the bundled sample data in site/src/data/ so the UI prototype still has
// something to show. Real plugin data always wins once any are registered.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginsDir = join(repoRoot, "plugins");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");
const outDir = join(repoRoot, "site", "public", "data");
const sampleDir = join(repoRoot, "site", "src", "data");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function isDir(path) {
  return existsSync(path) && statSync(path).isDirectory();
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
      body,
    });
  }
  return items;
}

function buildQuality(pluginDir, pluginJson) {
  const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return {
    validated: Boolean(
      pluginJson.name &&
        kebab.test(pluginJson.name) &&
        pluginJson.description &&
        pluginJson.version &&
        pluginJson.author?.name
    ),
    hasExamples: isDir(join(pluginDir, "examples")),
    hasHooks: existsSync(join(pluginDir, "hooks", "hooks.json")),
  };
}

function buildItemsForPlugin(pluginName, pluginDir, pluginJson, marketplaceName) {
  const installCommand = `claude plugin install ${pluginName}@${marketplaceName}`;
  const quality = buildQuality(pluginDir, pluginJson);
  const pluginTags = pluginJson.tags || [];

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
    updatedAt: gitUpdatedAt(join(pluginDir, ".claude-plugin", "plugin.json")),
    installCommand,
    quality,
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
    quality,
  }));

  return [pluginItem, ...sub];
}

function computeRelated(items, limit = 3) {
  for (const item of items) {
    const tagSet = new Set(item.tags);
    const scored = items
      .filter((other) => other.id !== item.id)
      .map((other) => {
        const overlap = other.tags.filter((t) => tagSet.has(t)).length;
        const sameplugin = other.plugin === item.plugin ? 0.5 : 0;
        return { id: other.id, score: overlap + sameplugin };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.id);
    item.related = scored;
  }
}

function buildChangelog(items) {
  const byPlugin = new Map();
  for (const item of items) {
    if (item.type !== "plugin") continue;
    byPlugin.set(item.plugin, item);
  }
  const entries = [];
  for (const plugin of byPlugin.values()) {
    entries.push({
      plugin: plugin.plugin,
      version: plugin.pluginVersion,
      date: plugin.updatedAt,
      title: `${plugin.plugin} ${plugin.pluginVersion}`,
    });
  }
  return entries.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function main() {
  mkdirSync(outDir, { recursive: true });

  if (!existsSync(marketplacePath)) {
    console.error(`Missing ${marketplacePath}`);
    process.exit(1);
  }
  const marketplace = readJson(marketplacePath);

  const pluginNames = isDir(pluginsDir)
    ? readdirSync(pluginsDir).filter((name) => isDir(join(pluginsDir, name)))
    : [];

  let items = [];
  for (const name of pluginNames) {
    const pluginDir = join(pluginsDir, name);
    const pluginJsonPath = join(pluginDir, ".claude-plugin", "plugin.json");
    if (!existsSync(pluginJsonPath)) continue;
    const pluginJson = readJson(pluginJsonPath);
    items.push(...buildItemsForPlugin(name, pluginDir, pluginJson, marketplace.name));
  }

  const usedSampleData = items.length === 0;
  if (usedSampleData) {
    items = readJson(join(sampleDir, "sample-index.json"));
  }
  computeRelated(items);
  const changelog = buildChangelog(items);

  writeFileSync(join(outDir, "search-index.json"), `${JSON.stringify(items, null, 2)}\n`);
  writeFileSync(join(outDir, "changelog.json"), `${JSON.stringify(changelog, null, 2)}\n`);

  console.log(
    usedSampleData
      ? `No registered plugins found — wrote bundled sample data (${items.length} items) to ${relative(repoRoot, outDir)}.`
      : `Indexed ${items.length} item(s) from ${pluginNames.length} plugin(s) into ${relative(repoRoot, outDir)}.`
  );
}

main();
