import { getCategories } from "@/lib/db";
import { NavbarClient } from "@/components/navbar-client";

// 服务端组件：负责获取分类数据
export async function Navbar() {
  const categories = await getCategories();

  // 构建导航链接：首页 + 动态分类 + 关于
  const navLinks = [
    { href: "/", label: "首页" },
    ...categories.map((cat) => ({
      href: `/category/${cat.slug}`,
      label: cat.name,
    })),
    { href: "/about", label: "关于" },
  ];

  return <NavbarClient navLinks={navLinks} />;
}
