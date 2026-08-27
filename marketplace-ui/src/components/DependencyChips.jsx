import { Link } from "react-router-dom";
import { pluginPath } from "../lib/routes.js";

// A dependency entry is either a plain string — "<plugin>" or
// "<plugin>:<artifact-name>" (see MARKETPLACE-UI-SPEC.md §4.1) — or a
// versioned object { name, version, marketplace } (Claude Code's real
// plugin.json schema, e.g. { "name": "shared-skills", "version": "^1.0.0" }).
// Both always link to the plugin's own detail page — an artifact suffix or a
// version range is documentation ("which part / which range you need"), not
// a deep link, since the referenced plugin may not even be registered in
// this catalog.
function normalizeDependency(dep) {
  if (typeof dep === "string") {
    return { key: dep, name: dep.split(":")[0], label: dep };
  }
  return {
    key: dep.name,
    name: dep.name,
    label: dep.version ? `${dep.name}@${dep.version}` : dep.name,
  };
}

export default function DependencyChips({ dependencies }) {
  if (!dependencies || dependencies.length === 0) return null;

  return (
    <section className="detail-section">
      <h2>Dependencies</h2>
      <div className="dep-chips">
        {dependencies.map(normalizeDependency).map((dep) => (
          <Link key={dep.key} className="dep-chip" to={pluginPath(dep.name)}>
            {dep.label} ↗
          </Link>
        ))}
      </div>
    </section>
  );
}
