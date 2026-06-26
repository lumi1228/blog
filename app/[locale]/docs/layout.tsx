import { getTranslations, setRequestLocale } from "next-intl/server";
import { getColumns } from "@/lib/db";
import { Footer } from "@/components/footer";
import { DocsTopbar, type DocsTab } from "@/components/docs/docs-topbar";
import type { Locale } from "@/i18n/config";

interface DocsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * 文档子站独立外壳布局。
 * 区别于主站 Navbar：提供文档专属顶部栏（文档集 Tab + 搜索 + 主题/语言切换）。
 * 该布局在 /docs 下的所有页面间持久存在，切换文档集时顶栏不重渲染。
 */
export default async function DocsLayout({ children, params }: DocsLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("docs");
  const columns = await getColumns(locale as Locale);

  const tabs: DocsTab[] = columns.map((col) => ({
    slug: col.slug,
    title: col.title,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <DocsTopbar tabs={tabs} locale={locale} docsLabel={t("label")} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
