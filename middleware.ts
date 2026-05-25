import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/utils/supabase/middleware";

// next-intl 中间件
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 路由：只走 Supabase 认证中间件，不走国际化
  if (pathname.startsWith("/admin")) {
    return await updateSession(request);
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
