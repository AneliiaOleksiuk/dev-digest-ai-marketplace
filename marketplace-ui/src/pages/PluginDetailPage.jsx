import { useNavigate, useParams, Link } from "react-router-dom";
import InstallBlock from "../components/InstallBlock.jsx";
import DependencyChips from "../components/DependencyChips.jsx";
import MarkdownBody from "../components/MarkdownBody.jsx";
import { KindDot } from "../components/KindBadge.jsx";
import NotFoundPage from "./NotFoundPage.jsx";
import { artifactPath } from "../lib/routes.js";
import { formatDate } from "../lib/format.js";
import { KIND_LABEL, REPO_URL } from "../lib/constants.js";

const COMP_ORDER = ["skill", "agent", "command", "hook", "mcp"];

export default function PluginDetailPage({ items }) {
  const { plugin: pluginName } = useParams();
  const navigate = useNavigate();

  const plugin = items.find((i) => i.type === "plugin" && i.plugin === pluginName);

  if (!plugin) return <NotFoundPage />;

  const groups = COMP_ORDER.map((kind) => {
    const groupItems = items.filter((i) => i.plugin === pluginName && i.type === kind);
    return groupItems.length ? { kind, items: groupItems } : null;
  }).filter(Boolean);

  const githubUrl = `${REPO_URL}/tree/main/plugins/${pluginName}`;

  return (
    <main className="page narrow">
      <button className="back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="detail-head">
        <div className="detail-icon">◆</div>
        <div style={{ flex: 1 }}>
          <div className="detail-title-row">
            <h1>{plugin.title}</h1>
            <span className="kind-pill" style={{ color: "var(--kind-plugin)", background: "color-mix(in oklab, var(--kind-plugin) 15%, transparent)" }}>
              v{plugin.pluginVersion}
            </span>
            {plugin.compatibility && <span className="compat-badge">✓ {plugin.compatibility}</span>}
          </div>
          <p className="detail-desc">{plugin.description}</p>
          <div className="detail-byline">
            {plugin.author} · updated {formatDate(plugin.updatedAt)}
          </div>
        </div>
      </div>

      <InstallBlock installCommand={plugin.installCommand} id={`p:${plugin.id}`} githubUrl={githubUrl} />

      <section className="detail-section">
        <h2>What's inside</h2>
        {groups.map((group) => (
          <div key={group.kind} className="comp-group">
            <div className="comp-group-head">
              <KindDot kind={group.kind} />
              <span className="label">{KIND_LABEL[group.kind]}</span>
              <span className="count">{group.items.length}</span>
            </div>
            <div className="comp-items">
              {group.items.map((item) => (
                <Link key={item.id} className="comp-item" to={artifactPath(item.plugin, item.type, item.name)}>
                  <div className="comp-item-row">
                    <span className="comp-item-name">{item.title}</span>
                    {item.invocation && <span className="comp-item-invocation">{item.invocation}</span>}
                  </div>
                  <div className="comp-item-desc">{item.description}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <DependencyChips dependencies={plugin.dependencies} />

      <section className="detail-section">
        <h2>README</h2>
        {/* Content sourced from this repo's own README.md files, not user input. */}
        <MarkdownBody source={plugin.body} className="readme-box markdown-body" />
      </section>

      <section className="detail-section">
        <h2>Changelog</h2>
        <div className="changelog-entries">
          {(plugin.changelog || []).map((c) => (
            <div key={c.version} className="changelog-entry">
              <div className="head">
                <span className="version">v{c.version}</span>
                <span className="date">{formatDate(c.date)}</span>
              </div>
              <div className="summary">{c.summary}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
