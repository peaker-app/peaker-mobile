import { Link } from "react-router";

export const DevEntryLink = () => (
  <Link
    to="/__dev/session"
    className="fixed bottom-20 end-3 z-30 rounded-full border border-border bg-card px-3 py-1 text-xs text-card-foreground shadow-md"
  >
    dev
  </Link>
);
