import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import { getSearchIndex, getDocsSearchIndex } from "@/lib/db";
import { DOCS_GATE_COOKIE, verifyToken } from "@/lib/docs-gate";

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

  // 知识库作用域受门禁保护：未持有效凭证时拒绝，避免绕过入口枚举文档内容
  if (scope === "docs" && process.env.DOCS_GATE_ENABLED !== "false") {
    const token = (await cookies()).get(DOCS_GATE_COOKIE)?.value;
    if (!(await verifyToken(token))) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
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
