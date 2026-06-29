import { getLocale, getTranslations } from "next-intl/server";
import { getCategories } from "@/lib/db";
import { NavbarClient, NavItem } from "@/components/navbar-client";

// 服务端组件：负责获取分类数据和翻译
export async function Navbar() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const categories = await getCategories(locale as "zh-CN" | "en");

  // 顺序即渲染顺序：首页 → 博客（下拉：全部博客 + 各分类） → 知识库 → 关于
  const navItems: NavItem[] = [
    { type: "link", href: "/", label: t("home") },
    {
      type: "dropdown",
      label: t("blog"),
      children: [
        { href: "/blog", label: t("allBlog") },
        ...categories.map((cat) => ({
          href: `/category/${cat.slug}`,
          label: cat.name,
        })),
      ],
    },
    { type: "link", href: "/docs", label: t("docs"), external: true },
    { type: "link", href: "/about", label: t("about") },
  ];

  return <NavbarClient navItems={navItems} locale={locale} />;
}
