#!/usr/bin/env node
// Gate: for every plugin that publishes plugins/<name>/evals/results/latest.json,
// checks it shows a clean pass for the plugin's CURRENT version before allowing
// a release. Skips any plugin with no evals/ data — this is opt-in: a plugin
// isn't required to publish eval data, but once it does, the data has to say
// "pass" for the version actually shipping. No dependencies, matches the style
// of scripts/validate-marketplace.mjs.
//
// Usage:
//   node scripts/check-eval-gate.mjs               # every plugin
//   node scripts/check-eval-gate.mjs <plugin-name>  # just one
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginsDir = join(repoRoot, "plugins");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const only = process.argv[2];
const errors = [];
const warn = (msg) => errors.push(msg);

if (!existsSync(pluginsDir)) {
  console.error(`Missing ${pluginsDir}`);
  process.exit(1);
}

const pluginNames = readdirSync(pluginsDir).filter((name) => statSync(join(pluginsDir, name)).isDirectory());

if (only && !pluginNames.includes(only)) {
  console.error(`error: "${only}" is not a directory under plugins/`);
  process.exit(1);
}

let checked = 0;
for (const name of pluginNames) {
  if (only && name !== only) continue;

  const pluginDir = join(pluginsDir, name);
  const pluginJsonPath = join(pluginDir, ".claude-plugin", "plugin.json");
  const evalsPath = join(pluginDir, "evals", "results", "latest.json");

  // Opt-in: no published eval data means nothing to gate for this plugin.
  if (!existsSync(evalsPath)) continue;
  if (!existsSync(pluginJsonPath)) continue;

  checked++;

  let evals, pluginJson;
  try {
    evals = readJson(evalsPath);
  } catch (e) {
    warn(`${name}: evals/results/latest.json is invalid JSON: ${e.message}`);
    continue;
  }
  try {
    pluginJson = readJson(pluginJsonPath);
  } catch (e) {
    warn(`${name}: .claude-plugin/plugin.json is invalid JSON: ${e.message}`);
    continue;
  }

  const label = `${name} (v${pluginJson.version})`;

  // A summary generated for an older/newer version says nothing about what's
  // actually shipping now — this is the "did anyone remember to re-check"
  // check, not just a pass/fail check.
  if (evals.pluginVersion !== pluginJson.version) {
    warn(
      `${label}: evals/results/latest.json was generated for v${evals.pluginVersion}, not the current ` +
        `v${pluginJson.version}. Re-run the eval suite for this version (or, if you've manually confirmed ` +
        `it still applies unchanged, update "pluginVersion" in latest.json) before releasing.`
    );
    continue; // pass/fail against data for a different version isn't meaningful
  }

  const s = evals.summary || {};
  const totalRuns = s.casesRun ?? 0;
  if ((s.failed ?? 0) > 0 || s.passed !== totalRuns) {
    warn(
      `${label}: eval summary is not clean — ${s.passed ?? 0}/${totalRuns} passed, ${s.failed ?? 0} failed. ` +
        `A version with a failing case should not ship.`
    );
  }

  if (typeof s.casesTotal === "number" && s.casesRun < s.casesTotal) {
    console.log(`  note: ${label} has only run ${s.casesRun}/${s.casesTotal} known cases — not blocking, but incomplete coverage.`);
  }
}

if (errors.length > 0) {
  console.error(`Found ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  checked > 0
    ? `OK: eval gate clean for ${checked} plugin(s) with published eval data.`
    : "OK: no plugin in scope publishes eval data yet — nothing to gate."
);
