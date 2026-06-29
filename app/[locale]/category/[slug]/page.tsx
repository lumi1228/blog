import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BlogListView } from "@/components/blog-list-view";
import { getPosts, getCategories, getCategoryBySlug } from "@/lib/db";
import { buildAlternates, SITE_NAME } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

/** 每页文章数（与 /blog 保持一致） */
const PAGE_SIZE = 10;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug, locale as Locale);

  if (!category) return { title: "Category Not Found" };

  const title = `${category.name} | ${SITE_NAME}`;
  const description = category.description ?? "";
  const { canonical, languages } = buildAlternates(
    `/category/${slug}`,
    `/en/category/${slug}`
  );

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "zh_CN",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const category = await getCategoryBySlug(slug, locale as Locale);

  if (!category) {
    notFound();
  }

  const { page } = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [categories, { posts, total }] = await Promise.all([
    getCategories(locale as Locale),
    getPosts({
      locale: locale as Locale,
      categorySlug: slug,
      limit: PAGE_SIZE,
      offset,
    }),
  ]);

  return (
    <>
      <Navbar />
      <BlogListView
        locale={locale}
        categories={categories}
        activeSlug={slug}
        posts={posts}
        total={total}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        title={category.name}
      />
      <Footer />
    </>
  );
}
