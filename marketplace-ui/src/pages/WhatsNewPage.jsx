import { Link } from "react-router-dom";
import { pluginPath } from "../lib/routes.js";
import { formatDate } from "../lib/format.js";

export default function WhatsNewPage({ changelog }) {
  return (
    <main className="page slim">
      <div className="section-head" style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>What's new</h1>
      </div>

      {(!changelog || changelog.length === 0) ? (
        <div className="empty-state">No releases yet.</div>
      ) : (
        <div>
          {changelog.map((r) => (
            <Link key={`${r.plugin}-${r.version}`} className="whats-new-full-row" to={pluginPath(r.plugin)}>
              <div className="col-version">
                <div className="v">v{r.version}</div>
                <div className="d">{formatDate(r.date)}</div>
              </div>
              <div className="col-body">
                <div className="name">{r.pluginTitle}</div>
                <div className="summary">{r.summary}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
