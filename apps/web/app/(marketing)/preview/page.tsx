import type { Metadata } from "next";
import Link from "next/link";
import { PreviewGate } from "./preview-gate";

export const metadata: Metadata = {
  title: "Preview • GetAppShots",
  description: "Development preview – password protected.",
  robots: "noindex, nofollow",
};

export default function PreviewPage() {
  return (
    <div className="min-h-[80vh] w-full bg-slate-100 dark:bg-slate-950">
      <div className="container mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-12">
        <PreviewGate />
        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link href="/" className="underline hover:text-slate-900 dark:hover:text-slate-200">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
