/**
 * 使用现有章节 ID 的独立章节目录。
 * --- @ty.aicoding@ ---
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getDocsChapter } from "@/lib/db";
import { DocsCatalog } from "@/components/docs/docs-catalog";
import type { Locale } from "@/i18n/config";

/**
 * --- @ty.aicoding@ ---
 */
interface PageProps {
  params: Promise<{ locale: string; set: string; chapter: string }>;
}

/**
 * --- @ty.aicoding@ ---
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, set, chapter } = await params;
  const data = await getDocsChapter(set, chapter, locale as Locale);
  if (!data) notFound();
  return { title: `${data.chapter.title} · ${data.directory.title}` };
}

/**
 * --- @ty.aicoding@ ---
 */
export default async function DocsChapterPage({ params }: PageProps) {
  const { locale, set, chapter } = await params;
  setRequestLocale(locale);
  const data = await getDocsChapter(set, chapter, locale as Locale);
  if (!data) notFound();
  return <DocsCatalog directory={data.directory} chapter={data.chapter} posts={data.posts} />;
}
