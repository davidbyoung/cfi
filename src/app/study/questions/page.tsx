import type { Metadata } from "next";
import Link from "next/link";
import { loadContent } from "@/lib/content/loader";
import QuestionSearch from "./_components/QuestionSearch";

export const metadata: Metadata = {
  title: "Question Bank",
};

export default function QuestionsPage() {
  const { searchIndex, tags } = loadContent();

  const tagList = Object.values(tags).sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/study" className="hover:opacity-80">
          Study
        </Link>
        {" / "}
        <span>Question Bank</span>
      </nav>

      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        Question Bank
      </h1>
      <p className="mb-10 text-muted">
        {searchIndex.length} questions — search by keyword or filter by tag.
      </p>

      <QuestionSearch searchIndex={searchIndex} tagList={tagList} />
    </main>
  );
}
