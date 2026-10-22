import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getAccessGateSessionTtl } from "@/lib/db";
import { DocsSessionTtlProvider } from "@/components/access-session-hint";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * 随本地化页面提供知识库提示配置，避免各入口单独发起配置请求。
 * --- @ty.aicoding@ ---
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // 验证 locale 有效性
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, docsSessionTtlSeconds] = await Promise.all([
    getMessages(),
    getAccessGateSessionTtl("docs"),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DocsSessionTtlProvider seconds={docsSessionTtlSeconds}>
        {children}
      </DocsSessionTtlProvider>
    </NextIntlClientProvider>
  );
}
