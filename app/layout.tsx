import type { Metadata } from "next";
import { Sora, Noto_Sans_SC, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// 标题字体：几何感、现代、有力量
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// 正文字体：中文优先，清晰可读
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// 代码字体：专业开发者气质
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumi's Blog",
  description: "一个女性开发者的技术博客",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${sora.variable} ${notoSansSC.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 主题初始化脚本，避免闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else if (theme === 'dark') {
                    document.documentElement.classList.remove('light');
                  } else {
                    // 跟随系统偏好
                    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                      document.documentElement.classList.add('light');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
