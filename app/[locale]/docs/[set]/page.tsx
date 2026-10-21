import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDocsDirectory } from "@/lib/db";
import { DocsCatalog } from "@/components/docs/docs-catalog";
import type { Locale } from "@/i18n/config";

/**
 * --- @ty.aicoding@ ---
 */
interface PageProps {
  params: Promise<{ locale: string; set: string }>;
}

/**
 * --- @ty.aicoding@ ---
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, set } = await params;
  const directory = await getDocsDirectory(set, locale as Locale);
  if (!directory) notFound();
  return { title: directory.title, description: directory.description };
}

/**
 * 知识库目录，按章节分组展示文章标题。
 * --- @ty.aicoding@ ---
 */
export default async function DocsSetPage({ params }: PageProps) {
  const { locale, set } = await params;
  setRequestLocale(locale);
  const directory = await getDocsDirectory(set, locale as Locale);
  if (!directory) notFound();
  return <DocsCatalog directory={directory} />;
}
