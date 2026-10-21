/**
 * Edge 资源门禁设置读取测试。
 * --- @ty.aicoding@ ---
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { isDocsGateEnabled } from "@/lib/access-gate";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const originalOverride = process.env.DOCS_GATE_ENABLED;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  if (originalServiceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
  if (originalOverride === undefined) delete process.env.DOCS_GATE_ENABLED;
  else process.env.DOCS_GATE_ENABLED = originalOverride;
});

describe("isDocsGateEnabled", () => {
  it("部署级 false 覆盖数据库设置并直接公开", async () => {
    process.env.DOCS_GATE_ENABLED = "false";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await isDocsGateEnabled()).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("数据库设置关闭时返回 false", async () => {
    delete process.env.DOCS_GATE_ENABLED;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ enabled: false }],
    }));
    expect(await isDocsGateEnabled()).toBe(false);
  });

  it("配置缺失或数据库查询失败时默认保持门禁开启", async () => {
    delete process.env.DOCS_GATE_ENABLED;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(await isDocsGateEnabled()).toBe(true);
  });
});
