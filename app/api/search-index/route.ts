import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { getSearchIndex, getDocsSearchIndex } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale");
  const scope = searchParams.get("scope"); // "docs" | null（默认全站）

  // 校验 locale 参数是否在允许的 locales 列表中
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    return NextResponse.json(
      { error: "invalid-locale" },
      { status: 400 }
    );
  }

  const validLocale = locale as "zh-CN" | "en";

  try {
    const entries =
      scope === "docs"
        ? await getDocsSearchIndex(validLocale)
        : await getSearchIndex(validLocale);

    return NextResponse.json(
      {
        locale: validLocale,
        scope: scope === "docs" ? "docs" : "site",
        generatedAt: new Date().toISOString(),
        entries,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (error) {
    console.error("[search-index] 数据库查询失败:", error);
    return NextResponse.json(
      { error: "search-index-failed" },
      { status: 500 }
    );
  }
}
