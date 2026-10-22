/**
 * 验证提示复用页面或探测配置，且展示过程不增加网络请求。
 * --- @ty.aicoding@ ---
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { AccessSessionHint, DocsSessionTtlProvider } from "@/components/access-session-hint";
import zhMessages from "@/messages/zh-CN.json";
import enMessages from "@/messages/en.json";

/**
 * --- @ty.aicoding@ ---
 */
afterEach(() => vi.unstubAllGlobals());

/**
 * --- @ty.aicoding@ ---
 */
describe("免验证有效期提示", () => {
  /**
   * --- @ty.aicoding@ ---
   */
  it("知识库和简历分别使用各自配置，且不请求接口", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(
      <NextIntlClientProvider locale="zh-CN" messages={zhMessages}>
        <DocsSessionTtlProvider seconds={259200}>
          <p><AccessSessionHint /></p>
          <p><AccessSessionHint sessionTtlSeconds={604800} /></p>
        </DocsSessionTtlProvider>
      </NextIntlClientProvider>
    );
    expect(screen.getByText("验证后最多 3 天内无需重复输入，且不超过授权码有效期。")).toBeInTheDocument();
    expect(screen.getByText("验证后最多 7 天内无需重复输入，且不超过授权码有效期。")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("简历探测未拿到时长时不误用知识库配置", () => {
    const { container } = render(
      <NextIntlClientProvider locale="zh-CN" messages={zhMessages}>
        <DocsSessionTtlProvider seconds={604800}>
          <AccessSessionHint sessionTtlSeconds={null} />
        </DocsSessionTtlProvider>
      </NextIntlClientProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("英文提示也展示实际时长，支持不足整天的配置", () => {
    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <AccessSessionHint sessionTtlSeconds={129600} />
      </NextIntlClientProvider>
    );
    expect(screen.getByText(/up to 1.5 days/)).toBeInTheDocument();
    expect(screen.getByText(/whichever comes first/)).toBeInTheDocument();
  });
});
