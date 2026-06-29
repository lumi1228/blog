import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BlogListView } from "@/components/blog-list-view";
import { getPosts, getCategories } from "@/lib/db";
import { buildAlternates, SITE_NAME } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

/** 每页文章数 */
const PAGE_SIZE = 10;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  const title = `${t("title")} | ${SITE_NAME}`;
  const description = t("subtitle");
  const { canonical, languages } = buildAlternates("/blog", "/en/blog");

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "zh_CN",
      title,
      description,
    },
  };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page } = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const t = await getTranslations({ locale, namespace: "blog" });

  const [categories, { posts, total }] = await Promise.all([
    getCategories(locale as Locale),
    getPosts({ locale: locale as Locale, limit: PAGE_SIZE, offset }),
  ]);

  return (
    <>
      <Navbar />
      <BlogListView
        locale={locale}
        categories={categories}
        activeSlug={null}
        posts={posts}
        total={total}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        title={t("title")}
      />
      <Footer />
    </>
  );
}
