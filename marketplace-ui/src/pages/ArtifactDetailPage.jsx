import { useParams, Link } from "react-router-dom";
import InstallBlock from "../components/InstallBlock.jsx";
import { KindPill } from "../components/KindBadge.jsx";
import MarkdownBody from "../components/MarkdownBody.jsx";
import NotFoundPage from "./NotFoundPage.jsx";
import { pluginPath } from "../lib/routes.js";

export default function ArtifactDetailPage({ items }) {
  const { plugin: pluginName, kind, name } = useParams();

  const item = items.find((i) => i.plugin === pluginName && i.type === kind && i.name === name);
  const plugin = items.find((i) => i.type === "plugin" && i.plugin === pluginName);

  if (!item) return <NotFoundPage />;

  return (
    <main className="page article">
      <div className="breadcrumb">
        <Link to="/search">Catalog</Link>
        <span className="sep"> / </span>
        <Link to={pluginPath(pluginName)}>{plugin ? plugin.title : pluginName}</Link>
        <span className="sep"> / {item.title}</span>
      </div>

      <div className="artifact-title-row">
        <KindPill kind={item.type} />
        <h1>{item.title}</h1>
        {item.invocation && <span className="invocation-badge">{item.invocation}</span>}
      </div>
      <p className="detail-desc">{item.description}</p>

      {item.tools?.length > 0 && (
        <div className="tools-row">
          <div className="tools-label">Tools / permissions</div>
          <div className="tools-list">
            {item.tools.map((t) => (
              <span key={t} className="tool-badge">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <InstallBlock installCommand={item.installCommand} id={`a:${item.id}`} />

      <section className="detail-section">
        <h2>Documentation</h2>
        {/* Content sourced from this repo's own SKILL.md/command/agent files, not user input. */}
        <MarkdownBody source={item.body} className="readme-box markdown-body" />
      </section>
    </main>
  );
}
