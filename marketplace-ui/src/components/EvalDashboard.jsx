// Renders the optional plugins/<name>/evals/results/latest.json summary a
// plugin can publish — pass rate, cost/token/time per case, and findings.
// Absent entirely for a plugin that hasn't published one; PluginDetailPage
// only renders this component when `plugin.evals` is truthy.
export default function EvalDashboard({ evals }) {
  if (!evals || !evals.summary) return null;

  const { summary, cases = [], findings = [], history = [], comparablePair, methodology, methodologyNote, costMethodology } = evals;
  const passRate = summary.casesRun > 0 ? Math.round((summary.passed / summary.casesRun) * 100) : 0;
  const maxTokens = Math.max(1, ...cases.map((c) => c.tokens || 0));

  return (
    <section className="detail-section eval-dashboard">
      <h2>Evals</h2>

      <div className="eval-stats">
        <div className="eval-stat">
          <div className="eval-stat-label">Pass rate</div>
          <div className="eval-stat-value" style={{ color: passRate === 100 ? "var(--kind-hook)" : "var(--kind-command)" }}>
            {summary.passed}/{summary.casesRun}
          </div>
        </div>
        <div className="eval-stat">
          <div className="eval-stat-label">Cases covered</div>
          <div className="eval-stat-value">
            {summary.casesRun}/{summary.casesTotal}
          </div>
        </div>
        <div className="eval-stat">
          <div className="eval-stat-label">Tokens</div>
          <div className="eval-stat-value mono">{formatTokens(summary.totalTokens)}</div>
        </div>
        <div className="eval-stat">
          <div className="eval-stat-label">Est. cost</div>
          <div className="eval-stat-value mono">
            {formatUsd(summary.costUsd)}
            {summary.costUsdRange && (
              <span className="eval-stat-sub">
                {" "}
                ({formatUsd(summary.costUsdRange[0])}&ndash;{formatUsd(summary.costUsdRange[1])})
              </span>
            )}
          </div>
        </div>
        <div className="eval-stat">
          <div className="eval-stat-label">Wall-clock</div>
          <div className="eval-stat-value mono">{formatDuration(summary.totalSeconds)}</div>
        </div>
      </div>

      {cases.length > 0 && (
        <div className="eval-bars">
          {cases.map((c) => (
            <div key={c.name} className="eval-bar-row" title={`${c.name} — ${formatTokens(c.tokens)} tokens, ${formatDuration(c.seconds)}, ${formatUsd(c.costUsd)}`}>
              <div className="eval-bar-name">
                <span className={`eval-outcome-dot ${c.outcome === "pass" ? "pass" : "fail"}`} />
                <span className="eval-bar-name-text">{c.name}</span>
              </div>
              <div className="eval-bar-track">
                <div
                  className={`eval-bar-fill ${c.type === "chain" ? "chain" : "single"}`}
                  style={{ width: `${Math.max(3, ((c.tokens || 0) / maxTokens) * 100)}%` }}
                />
              </div>
              <div className="eval-bar-value mono">{formatTokens(c.tokens)}</div>
            </div>
          ))}
          <div className="eval-legend">
            <span className="eval-legend-item">
              <span className="eval-legend-dot single" /> single-agent
            </span>
            <span className="eval-legend-item">
              <span className="eval-legend-dot chain" /> orchestrator chain
            </span>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="eval-history">
          <div className="eval-subhead">Version history</div>

          <RoundMetricBars history={history} />
          <div className="eval-round-chart-caption">
            Totals per round, not normalized per run — Round 1 had {history[0]?.totalRuns ?? history[0]?.casesRun} runs, Round 2 had{" "}
            {history[1]?.totalRuns ?? history[1]?.casesRun}. A shorter bar here means the round did less work in total, not that each run got
            cheaper — see the like-for-like pair below for that.
          </div>

          <div className="eval-history-rows">
            {history.map((h) => {
              const totalRuns = h.totalRuns ?? h.casesRun;
              const allPassed = h.passed === totalRuns;
              return (
              <div key={h.round} className="eval-history-row">
                <div className="eval-history-version mono">v{h.version}</div>
                <div className="eval-history-stats">
                  <span className="mono" style={{ color: allPassed ? "var(--kind-hook)" : "var(--kind-mcp)", fontWeight: 600 }}>
                    {h.passed}/{totalRuns} passed
                  </span>
                  <span>
                    {h.casesRun} case{h.casesRun === 1 ? "" : "s"}
                    {h.adHocChecks ? ` + ${h.adHocChecks} ad-hoc check${h.adHocChecks === 1 ? "" : "s"}` : ""}
                  </span>
                  <span className="mono">{formatTokens(h.totalTokens)} tok</span>
                  <span className="mono">{formatDuration(h.totalSeconds)}</span>
                  <span className="mono">
                    {formatUsd(h.costUsd)}
                    <span className="eval-stat-sub">
                      {" "}
                      ({formatUsd(h.costUsdRange?.[0])}&ndash;{formatUsd(h.costUsdRange?.[1])})
                    </span>
                  </span>
                </div>
                <div className="eval-history-note">{h.note}</div>
              </div>
              );
            })}
          </div>

          {comparablePair && (
            <div className="eval-pair">
              <div className="eval-pair-title">
                The one true before/after: <span className="mono">{comparablePair.case}</span>
              </div>
              <div className="eval-pair-rows">
                <PairRow label="R1" data={comparablePair.round1} max={Math.max(comparablePair.round1.tokens, comparablePair.round2.tokens)} />
                <PairRow label="R2" data={comparablePair.round2} max={Math.max(comparablePair.round1.tokens, comparablePair.round2.tokens)} />
              </div>
              <div className="eval-pair-note">{comparablePair.note}</div>
            </div>
          )}
        </div>
      )}

      {findings.length > 0 && (
        <ul className="eval-findings">
          {findings.map((f, i) => (
            <li key={i} className={`eval-finding ${f.severity}`}>
              <span className="eval-finding-tag">{f.severity}</span>
              <span>{f.summary}</span>
            </li>
          ))}
        </ul>
      )}

      {(methodologyNote || methodology) && (
        <p className="eval-methodology">
          {methodology === "manual-dry-run" ? "Manual dry run" : methodology} &mdash; {methodologyNote}
          {costMethodology && <> {costMethodology.note}</>}
        </p>
      )}
    </section>
  );
}

const ROUND_COLORS = ["var(--text-faint)", "var(--kind-agent)", "var(--kind-command)", "var(--kind-mcp)"];

const ROUND_METRICS = [
  { key: "totalTokens", label: "Tokens", fmt: formatTokens },
  { key: "totalSeconds", label: "Duration", fmt: formatDuration },
  { key: "costUsd", label: "Est. cost", fmt: formatUsd },
];

// One grouped bar chart per metric (tokens / duration / cost), one bar per
// round — makes the version-to-version delta visible at a glance, not just
// as numbers in the rows below.
function RoundMetricBars({ history }) {
  return (
    <div className="eval-round-chart">
      {ROUND_METRICS.map((m) => {
        const max = Math.max(1, ...history.map((h) => h[m.key] || 0));
        return (
          <div key={m.key} className="eval-round-metric">
            <div className="eval-round-metric-label">{m.label}</div>
            {history.map((h, i) => (
              <div key={h.round} className="eval-round-bar-row">
                <span className="eval-round-bar-label mono">v{h.version}</span>
                <div className="eval-round-bar-track">
                  <div
                    className="eval-round-bar-fill"
                    style={{
                      width: `${Math.max(3, ((h[m.key] || 0) / max) * 100)}%`,
                      background: ROUND_COLORS[i % ROUND_COLORS.length],
                    }}
                  />
                </div>
                <span className="eval-round-bar-value mono">{m.fmt(h[m.key])}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function PairRow({ label, data, max }) {
  const pct = Math.max(3, ((data.tokens || 0) / max) * 100);
  return (
    <div className="eval-pair-row">
      <span className="eval-pair-label mono">{label}</span>
      <div className="eval-pair-track">
        <div className={`eval-pair-fill ${label === "R1" ? "round1" : "round2"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="eval-pair-value mono">
        {formatTokens(data.tokens)} &middot; {formatDuration(data.seconds)} &middot; {formatUsd(data.costUsd)}
      </span>
    </div>
  );
}

function formatTokens(n) {
  if (n == null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatUsd(n) {
  if (n == null) return "—";
  return `$${n.toFixed(2)}`;
}

function formatDuration(s) {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}
