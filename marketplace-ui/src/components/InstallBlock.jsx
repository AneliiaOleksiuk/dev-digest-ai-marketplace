import CopyButton from "./CopyButton.jsx";

export default function InstallBlock({ installCommand, id, githubUrl }) {
  return (
    <div className="install-row">
      <div className="install-term">
        <span className="prompt">$</span>
        <span className="cmd">{installCommand}</span>
      </div>
      <CopyButton text={installCommand} id={id} className="btn btn-primary" label="Copy install" />
      {githubUrl && (
        <a className="btn btn-secondary" href={githubUrl} target="_blank" rel="noreferrer">
          View on GitHub ↗
        </a>
      )}
    </div>
  );
}
