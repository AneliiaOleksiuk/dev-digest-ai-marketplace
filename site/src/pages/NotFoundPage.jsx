import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <p>Nothing here.</p>
      <Link to="/">Back to catalog</Link>
    </div>
  );
}
