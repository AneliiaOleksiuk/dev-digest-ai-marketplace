import CopyButton from "./CopyButton.jsx";
import { MARKETPLACE_NAME } from "../lib/constants.js";

export default function InstallBlock({ item }) {
  const addCommand = `claude plugin marketplace add ./${MARKETPLACE_NAME}`;
  const installCommand = item.installCommand;

  return (
    <div className="install-block">
      <div className="copy-row">
        <pre>{addCommand}</pre>
        <CopyButton text={addCommand} />
      </div>
      <div className="copy-row">
        <pre>{installCommand}</pre>
        <CopyButton text={installCommand} />
      </div>
    </div>
  );
}
