import { Link } from "react-router-dom";
import CopyButton from "../components/CopyButton.jsx";
import { MARKETPLACE_NAME } from "../lib/constants.js";

const STEPS = [
  {
    n: "1",
    title: "Add the marketplace as a source",
    desc: "Registers this repository's catalog with your Claude Code.",
    cmd: `claude plugin marketplace add AneliiaOleksiuk/${MARKETPLACE_NAME}`,
  },
  {
    n: "2",
    title: "Install the plugin you need",
    desc: "Installs a specific plugin from this marketplace, by name.",
    cmd: `claude plugin install <plugin-name>@${MARKETPLACE_NAME}`,
  },
  {
    n: "3",
    title: "Update",
    desc: "Periodically refresh the list of sources and the plugins themselves.",
    cmd: "claude plugin marketplace update",
  },
];

export default function GettingStartedPage() {
  return (
    <main className="page slim">
      <Link className="back-link" to="/">
        ← Home
      </Link>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
        How to connect the marketplace
      </h1>
      <p style={{ color: "var(--text-dim)", margin: "0 0 32px", maxWidth: 560 }}>
        Three steps. First add the marketplace as a source, then install individual plugins.
      </p>

      <div>
        {STEPS.map((s, i) => (
          <div key={s.n} className="step-row">
            <div className="step-num">{s.n}</div>
            <div className="step-body">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="step-cmd">
                <span className="cmd">{s.cmd}</span>
                <CopyButton text={s.cmd} id={`s:${i}`} className="" label="Copy" copiedLabel="✓" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="getting-started-note">
        <strong>marketplace update vs. plugin update.</strong> The first refreshes the list of
        sources (where plugins come from); the second updates the code of an already-installed
        plugin.
      </div>
    </main>
  );
}
