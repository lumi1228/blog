import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */

  // 旧专栏链接 301 永久重定向到文档站，保留 SEO 权重与外部收藏链接。
  // next-intl 使用 as-needed 前缀：默认语言 zh-CN 无前缀，en 带 /en 前缀，
  // 因此中英文路径都需各配一组。
  async redirects() {
    return [
      // 默认语言（zh-CN，无前缀）
      { source: "/columns", destination: "/docs", permanent: true },
      { source: "/columns/:path*", destination: "/docs/:path*", permanent: true },
      // 英文（/en 前缀）
      { source: "/en/columns", destination: "/en/docs", permanent: true },
      { source: "/en/columns/:path*", destination: "/en/docs/:path*", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
