import { Link } from "react-router-dom";
import { pluginPath } from "../lib/routes.js";

// Each dependency is "<plugin>" or "<plugin>:<artifact-name>" (see
// MARKETPLACE-UI-SPEC.md §4.1) but always links to the plugin's own detail
// page — the artifact suffix is documentation ("which part of it you need"),
// not a deep link, since the referenced plugin may not even be registered
// in this catalog.
export default function DependencyChips({ dependencies }) {
  if (!dependencies || dependencies.length === 0) return null;

  return (
    <section className="detail-section">
      <h2>Dependencies</h2>
      <div className="dep-chips">
        {dependencies.map((dep) => (
          <Link key={dep} className="dep-chip" to={pluginPath(dep.split(":")[0])}>
            {dep} ↗
          </Link>
        ))}
      </div>
    </section>
  );
}
