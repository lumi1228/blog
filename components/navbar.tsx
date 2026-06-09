import { getLocale, getTranslations } from "next-intl/server";
import { getCategories, getColumns } from "@/lib/db";
import { NavbarClient, NavItem } from "@/components/navbar-client";

// 服务端组件：负责获取分类数据和翻译
export async function Navbar() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const tColumn = await getTranslations("column");
  const categories = await getCategories(locale as "zh-CN" | "en");
  const columns = await getColumns(locale as "zh-CN" | "en");

  const columnItems = columns.map((col) => ({
    href: `/columns/${col.slug}`,
    label: col.title,
  }));

  // 顺序即渲染顺序：首页 → 分类 → 专栏 → 关于
  const navItems: NavItem[] = [
    { type: "link", href: "/", label: t("home") },
    ...categories.map((cat) => ({
      type: "link" as const,
      href: `/category/${cat.slug}`,
      label: cat.name,
    })),
    { type: "columns", label: tColumn("title"), items: columnItems },
    { type: "link", href: "/about", label: t("about") },
  ];

  return <NavbarClient navItems={navItems} locale={locale} />;
}
