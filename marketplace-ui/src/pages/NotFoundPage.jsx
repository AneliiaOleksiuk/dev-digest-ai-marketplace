import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page not-found">
      <p>Nothing here.</p>
      <Link to="/">Back to catalog</Link>
    </main>
  );
}
