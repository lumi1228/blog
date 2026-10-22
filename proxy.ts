import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/utils/supabase/middleware";
import { DOCS_GATE_COOKIE, verifyToken } from "@/lib/docs-gate";
import { isDocsGateEnabled } from "@/lib/access-gate";

// next-intl 中间件
const intlMiddleware = createMiddleware(routing);

// 匹配知识库路径：/docs、/docs/...、/en/docs、/en/docs/...
// 注意 /unlock-docs（解锁页）不以 docs 段开头，天然不匹配
const DOCS_PATH = /^\/(en\/)?docs(\/|$)/;

/**
 * 应用后台认证、知识库门禁与国际化路由中间件。
 * --- @ty.aicoding@ ---
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // /admin 路由：只走 Supabase 认证中间件，不走国际化
  if (pathname.startsWith("/admin")) {
    return await updateSession(request);
  }

  // 知识库门禁：入口处校验一次授权码，凭按数据库时长签发的 cookie 放行后续访问
  if (DOCS_PATH.test(pathname) && (await isDocsGateEnabled())) {
    const token = request.cookies.get(DOCS_GATE_COOKIE)?.value;
    const valid = await verifyToken(token, "docs");
    if (!valid) {
      const isEn = pathname.startsWith("/en/");
      const unlockUrl = new URL(
        isEn ? "/en/unlock-docs" : "/unlock-docs",
        request.url
      );
      // 记录原始目标，解锁后跳回
      unlockUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(unlockUrl);
    }
  }

  // 前台路由：走国际化中间件
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // 匹配所有路由，排除静态资源和 API
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
