import { getLocale, getTranslations } from "next-intl/server";
import { getCategories, getColumns } from "@/lib/db";
import { NavbarClient } from "@/components/navbar-client";

// 服务端组件：负责获取分类数据和翻译
export async function Navbar() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const categories = await getCategories(locale as "zh-CN" | "en");
  const columns = await getColumns(locale as "zh-CN" | "en");

  // 构建导航链接：首页 + 专栏下拉 + 动态分类 + 关于
  const navLinks = [
    { href: "/", label: t("home") },
    ...categories.map((cat) => ({
      href: `/category/${cat.slug}`,
      label: cat.name,
    })),
    { href: "/about", label: t("about") },
  ];

  const columnNavItems = columns.map((col) => ({
    href: `/columns/${col.slug}`,
    label: col.title,
  }));

  return (
    <NavbarClient
      navLinks={navLinks}
      locale={locale}
      columnItems={columnNavItems}
    />
  );
}
