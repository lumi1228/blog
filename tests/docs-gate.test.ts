import { describe, it, expect, beforeAll } from "vitest";

// 在导入模块前注入密钥，确保签名可用
beforeAll(() => {
  process.env.DOCS_GATE_SECRET = "test-secret-for-docs-gate";
});

import { signToken, verifyToken, DOCS_GATE_TTL_MS } from "@/lib/docs-gate";

describe("docs-gate 签名凭证", () => {
  it("签发的凭证能通过校验", async () => {
    const token = await signToken();
    expect(token).toMatch(/^\d+\..+/);
    expect(await verifyToken(token)).toBe(true);
  });

  it("默认有效期约为 7 天", async () => {
    const token = await signToken();
    const exp = Number(token.split(".")[0]);
    const delta = exp - Date.now();
    // 允许少量执行耗时偏差
    expect(delta).toBeGreaterThan(DOCS_GATE_TTL_MS - 5000);
    expect(delta).toBeLessThanOrEqual(DOCS_GATE_TTL_MS + 100);
  });

  it("过期凭证校验失败", async () => {
    const token = await signToken(-1000); // 已过期
    expect(await verifyToken(token)).toBe(false);
  });

  it("被篡改的签名校验失败", async () => {
    const token = await signToken();
    const [exp] = token.split(".");
    const tampered = `${exp}.AAAAtampered`;
    expect(await verifyToken(tampered)).toBe(false);
  });

  it("被篡改的过期时间校验失败（签名不匹配）", async () => {
    const token = await signToken();
    const sig = token.split(".")[1];
    const forgedExp = Date.now() + DOCS_GATE_TTL_MS * 10;
    const tampered = `${forgedExp}.${sig}`;
    expect(await verifyToken(tampered)).toBe(false);
  });

  it("空值或格式非法返回 false", async () => {
    expect(await verifyToken(undefined)).toBe(false);
    expect(await verifyToken(null)).toBe(false);
    expect(await verifyToken("")).toBe(false);
    expect(await verifyToken("nodot")).toBe(false);
    expect(await verifyToken(".abc")).toBe(false);
  });
});
