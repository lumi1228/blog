import { describe, it, expect, beforeAll } from "vitest";

// 在导入模块前注入密钥，确保签名可用
beforeAll(() => {
  process.env.DOCS_GATE_SECRET = "test-secret-for-docs-gate";
});

import { signToken, verifyToken, DOCS_GATE_TTL_MS } from "@/lib/docs-gate";

describe("docs-gate 签名凭证", () => {
  /**
   * --- @ty.aicoding@ ---
   */
  it("签发的凭证能通过校验", async () => {
    const token = await signToken("docs");
    expect(token).toMatch(/^docs\.\d+\..+/);
    expect(await verifyToken(token, "docs")).toBe(true);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("默认有效期约为 7 天", async () => {
    const token = await signToken("docs");
    const exp = Number(token.split(".")[1]);
    const delta = exp - Date.now();
    // 允许少量执行耗时偏差
    expect(delta).toBeGreaterThan(DOCS_GATE_TTL_MS - 5000);
    expect(delta).toBeLessThanOrEqual(DOCS_GATE_TTL_MS + 100);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("过期凭证校验失败", async () => {
    const token = await signToken("docs", -1000); // 已过期
    expect(await verifyToken(token, "docs")).toBe(false);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("被篡改的签名校验失败", async () => {
    const token = await signToken("docs");
    const [resource, exp] = token.split(".");
    const tampered = `${resource}.${exp}.AAAAtampered`;
    expect(await verifyToken(tampered, "docs")).toBe(false);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("被篡改的过期时间校验失败（签名不匹配）", async () => {
    const token = await signToken("docs");
    const sig = token.split(".")[2];
    const forgedExp = Date.now() + DOCS_GATE_TTL_MS * 10;
    const tampered = `docs.${forgedExp}.${sig}`;
    expect(await verifyToken(tampered, "docs")).toBe(false);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("知识库凭证不能作为简历凭证使用", async () => {
    const token = await signToken("docs");
    expect(await verifyToken(token, "resume")).toBe(false);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("空值或格式非法返回 false", async () => {
    expect(await verifyToken(undefined, "docs")).toBe(false);
    expect(await verifyToken(null, "docs")).toBe(false);
    expect(await verifyToken("", "docs")).toBe(false);
    expect(await verifyToken("nodot", "docs")).toBe(false);
    expect(await verifyToken(".abc", "docs")).toBe(false);
  });
});
