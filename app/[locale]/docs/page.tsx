import { getTranslations, setRequestLocale } from "next-intl/server";
import { getColumnsWithFirstPost } from "@/lib/db";
import { redirect } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * 文档站入口（TRAE 风格）：不再展示门户卡片网格。
 * 直接重定向到「第一个文档集的第一篇文章」，使进站即落到正文。
 * 仅当完全没有可展示内容时，渲染空状态。
 * 外壳（顶栏 + Footer）由 app/[locale]/docs/layout.tsx 提供。
 */
export default async function DocsHomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const columns = await getColumnsWithFirstPost(locale as Locale);

  // 选取第一个含已发布文章的文档集，重定向到其首篇
  const target = columns.find((col) => col.firstPostSlug);
  if (target) {
    redirect({
      href: `/docs/${target.slug}/${target.firstPostSlug}`,
      locale,
    });
  }

  // 无任何可展示文章：空状态
  const t = await getTranslations("docs");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
        <h1
          className="text-lg font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{t("empty")}</p>
      </div>
    </main>
  );
}
