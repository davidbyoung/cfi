import type { Metadata } from "next";
import { Suspense } from "react";
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
    <div className="mx-auto max-w-4xl px-6 py-6 sm:px-8 sm:py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link
          href="/study"
          className="underline underline-offset-2 hover:opacity-80"
        >
          Ground School
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

      <Suspense fallback={<p className="text-muted">Loading questions…</p>}>
        <QuestionSearch searchIndex={searchIndex} tagList={tagList} />
      </Suspense>
    </div>
  );
}
