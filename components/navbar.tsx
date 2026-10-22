import { getLocale, getTranslations } from "next-intl/server";
import { NavbarClient, NavItem } from "@/components/navbar-client";

/**
 * 服务端组件：负责获取导航翻译。
 * --- @ty.aicoding@ ---
 */
export async function Navbar() {
  const locale = await getLocale();
  const t = await getTranslations("nav");

  // 顺序即渲染顺序：首页 → 博客 → 知识库 → 关于
  const navItems: NavItem[] = [
    { type: "link", href: "/", label: t("home") },
    { type: "link", href: "/blog", label: t("blog") },
    { type: "link", href: "/docs", label: t("docs"), gated: true },
    { type: "link", href: "/about", label: t("about") },
  ];

  return <NavbarClient navItems={navItems} locale={locale} />;
}
