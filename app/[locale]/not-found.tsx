import { useTranslations } from "next-intl";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <>
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="relative text-center">
          <div
            className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 
                       rounded-full opacity-30 blur-[100px]"
            style={{ background: "var(--glow-primary)" }}
          />

          <div
            className="mb-4 text-[120px] font-bold leading-none tracking-tighter text-[var(--accent-primary)] 
                       opacity-80 sm:text-[180px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            404
          </div>

          <div
            className="mx-auto mb-6 h-px w-24"
            style={{ background: "linear-gradient(to right, transparent, var(--accent-primary), transparent)" }}
          />

          <h1
            className="mb-3 text-2xl font-semibold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("notFound")}
          </h1>
          <p className="mb-8 max-w-md text-sm text-[var(--text-secondary)]">
            {t("notFoundDesc")}
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] 
                         bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium
                         text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)]
                         hover:shadow-[var(--shadow-glow-accent)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t("backHome")}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
