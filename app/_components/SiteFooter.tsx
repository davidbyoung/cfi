import {
  CANCELLATION_LINE,
  INSTRUCTOR_EMAIL,
  INSTRUCTOR_NAME,
  PAYMENT_METHODS_LINE,
} from "../_content";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-rule">
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8 text-sm text-muted">
        <p className="mb-4">
          Email:{" "}
          <a
            className="text-foreground underline decoration-1 underline-offset-2 hover:opacity-80"
            href={`mailto:${INSTRUCTOR_EMAIL}`}
          >
            {INSTRUCTOR_EMAIL}
          </a>
        </p>
        <p>
          © {year} {INSTRUCTOR_NAME}.
        </p>
      </div>
    </footer>
  );
}
