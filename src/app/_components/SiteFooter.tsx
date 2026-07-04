import { INSTRUCTOR_NAME } from "../_content";

export default function SiteFooter() {
  // Evaluated at build time — rebuild annually to keep current.
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8 text-sm text-muted">
        <p>
          © {year} {INSTRUCTOR_NAME}
        </p>
      </div>
    </footer>
  );
}
