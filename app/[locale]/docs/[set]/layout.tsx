/**
 * 知识库共享侧栏布局；目录、章节及文章之间切换时保留侧栏。
 * --- @ty.aicoding@ ---
 */
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getDocsDirectory } from "@/lib/db";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import type { Locale } from "@/i18n/config";

/**
 * --- @ty.aicoding@ ---
 */
export default async function DocsSetLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ locale: string; set: string }>;
}) {
  const { locale, set } = await params;
  setRequestLocale(locale);
  const [directory, t] = await Promise.all([
    getDocsDirectory(set, locale as Locale),
    getTranslations("docs"),
  ]);
  if (!directory) notFound();
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <DocsSidebar key={directory.id} setSlug={directory.slug} setTitle={directory.title} chapters={directory.chapters} drawerLabel={t("label")} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
