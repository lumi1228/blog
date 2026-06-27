"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import type { ResumeData } from "@/lib/types";

/**
 * 关于我页面「查看简历」入口 + 授权码门禁 + 简历预览弹框 + 导出 PDF。
 *
 * - 自带触发按钮，点击打开弹框；需先输入授权码解锁。
 * - 简历数据不随页面下发，解锁时由 /api/resume/unlock 服务端校验授权码后返回，
 *   防止电话/邮箱等信息被绕过门禁获取。
 * - 不记忆解锁状态：关闭弹框即清空，再次打开需重新输入授权码。
 * - 简历版式参考附件：深蓝标题栏 + 板块图标 + 基本信息双栏（含证件照）+ 列表。
 * - 「导出 PDF」用 html2canvas-pro 截图 + jsPDF 按安全断点分页，直接下载。
 */
export function ResumeModal() {
  const t = useTranslations("resume");
  const tAbout = useTranslations("about");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 授权码门禁状态
  const [code, setCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [probing, setProbing] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    // 不记忆：关闭即重置，再次打开需重新解锁
    setResume(null);
    setCode("");
    setError("");
  }, []);

  // ESC 关闭 + 打开时锁定背景滚动
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  // 打开时探测门禁：门禁关则直接拿到简历；门禁开则提示需要授权码（不报错）
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setProbing(true);
    (async () => {
      try {
        const res = await fetch("/api/resume/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setResume(data.resume as ResumeData);
        }
        // 401（code_required）等 → 保持输码态，不展示错误
      } catch {
        // 网络异常 → 退回输码态
      } finally {
        if (!cancelled) setProbing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, locale]);

  const handleUnlock = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!code.trim() || unlocking) return;
      setUnlocking(true);
      setError("");
      try {
        const res = await fetch("/api/resume/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code.trim(), locale }),
        });
        if (res.ok) {
          const data = await res.json();
          setResume(data.resume as ResumeData);
        } else if (res.status === 429) {
          setError(t("tooMany"));
        } else {
          setError(t("wrongCode"));
        }
      } catch {
        setError(t("wrongCode"));
      } finally {
        setUnlocking(false);
      }
    },
    [code, unlocking, locale, t]
  );

  const handleExport = useCallback(async () => {
    const el = document.getElementById("resume-print-area");
    if (!el || exporting || !resume) return;
    setExporting(true);
    try {
      // 动态加载，避免进入首屏 bundle
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        // 截图时去除屏幕上的卡片投影/圆角/外边距，避免导出件边角出现阴影伪影
        onclone: (_doc, clonedEl) => {
          clonedEl.style.boxShadow = "none";
          clonedEl.style.margin = "0";
          clonedEl.style.borderRadius = "0";
        },
      });

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // CSS px → canvas px 的实际缩放比
      const ratio = canvas.height / el.scrollHeight;
      // 每页上下留白，避免内容贴边
      const margin = 24;
      const usableH = pageH - margin * 2;
      // 每页最多可容纳的源画布像素高度（按页宽等比缩放后铺满可用高度）
      const pageSlicePx = Math.floor(canvas.width * (usableH / pageW));

      // 收集「可安全断开」的纵向位置：板块开头、非首位的条目/要点之前。
      // 这样板块标题与条目标题永远与其后内容同页，不会被孤立在页底。
      const containerTop = el.getBoundingClientRect().top;
      const breakNodes = el.querySelectorAll<HTMLElement>("[data-pdf-break]");
      const breakSet = new Set<number>();
      breakNodes.forEach((node) => {
        const top = Math.round((node.getBoundingClientRect().top - containerTop) * ratio);
        if (top > 0 && top < canvas.height) breakSet.add(top);
      });
      const breaks = Array.from(breakSet).sort((a, b) => a - b);

      // 在 [start, maxEnd] 范围内找最靠后的安全断点；找不到则硬切到 maxEnd
      const findBreak = (start: number, maxEnd: number): number => {
        let best = -1;
        for (const b of breaks) {
          if (b > start && b <= maxEnd) best = b;
          else if (b > maxEnd) break;
        }
        return best > start ? best : maxEnd;
      };

      let renderY = 0;
      let first = true;
      while (renderY < canvas.height - 1) {
        const maxEnd = renderY + pageSlicePx;
        const sliceEnd = maxEnd >= canvas.height ? canvas.height : findBreak(renderY, maxEnd);
        const sliceH = sliceEnd - renderY;

        // 把这一页对应的区域绘制到临时画布，作为独立页图
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceH;
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, renderY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        }

        const imgData = pageCanvas.toDataURL("image/png");
        const imgH = (sliceH * pageW) / canvas.width;
        if (!first) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, margin, pageW, imgH);
        first = false;
        renderY = sliceEnd;
      }

      const safeName = (resume.profile?.name || "resume").replace(/[\\/:*?"<>|\s]+/g, "_");
      pdf.save(`${safeName}.pdf`);
    } catch (err) {
      console.error("导出 PDF 失败:", err);
      alert(t("exportError"));
    } finally {
      setExporting(false);
    }
  }, [exporting, resume, t]);

  return (
    <>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-[var(--radius-full)]
                   border border-[var(--accent-primary)]/30 bg-[var(--accent-muted)]
                   px-6 py-2.5 text-sm font-semibold text-[var(--accent-primary)]
                   transition-all duration-[var(--duration-fast)]
                   hover:bg-[var(--accent-primary)] hover:text-[#030712]
                   hover:scale-105 hover:shadow-[var(--shadow-glow-accent)]
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {tAbout("viewResume")}
      </button>

      {/* 弹框（Portal 到 body，避免被祖先 transform/animation 困住定位） */}
      {open && mounted && createPortal(
        <div
          className="resume-overlay fixed inset-0 z-[60] flex flex-col bg-black/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          onClick={close}
        >
          {/* 工具栏 */}
          <div className="resume-toolbar flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <h2
              className="text-base font-bold text-white sm:text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("title")}
            </h2>
            <div className="flex items-center gap-2">
              {resume && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport();
                  }}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)]
                             bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white
                             transition-all duration-[var(--duration-fast)]
                             hover:bg-[var(--accent-hover)] disabled:opacity-50
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 7H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {exporting ? t("exporting") : t("export")}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
                aria-label={t("close")}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]
                           text-white/80 transition-colors duration-[var(--duration-fast)]
                           hover:bg-white/10 hover:text-white
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 内容区：探测中 → 加载；门禁关 → 直接简历；门禁开 → 授权码输入 */}
          <div className="flex-1 overflow-y-auto px-3 pb-10 sm:px-6">
            {resume ? (
              <ResumeSheet resume={resume} />
            ) : probing ? (
              <div className="mt-24 flex flex-col items-center gap-3 text-white/80" onClick={(e) => e.stopPropagation()}>
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                <span className="text-sm">{t("unlocking")}</span>
              </div>
            ) : (
              <div
                className="mx-auto mt-16 w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6a2.25 2.25 0 012.25-2.25z" />
                  </svg>
                </div>
                <h3
                  className="mb-1.5 text-lg font-bold text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t("lockTitle")}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {t("lockDesc")}
                </p>
                <form onSubmit={handleUnlock} className="space-y-3">
                  <input
                    type="password"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder={t("codePlaceholder")}
                    autoFocus
                    aria-label={t("codePlaceholder")}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-2.5 text-center text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                  {error && (
                    <p className="text-sm text-[var(--error)]" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={!code.trim() || unlocking}
                    className="w-full rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-[var(--duration-fast)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
                  >
                    {unlocking ? t("unlocking") : t("unlock")}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

/** 简历纸张：固定浅色版式，复刻附件结构 */
function ResumeSheet({ resume }: { resume: ResumeData }) {
  const t = useTranslations("resume");
  const { profile, skills, experiences, projects } = resume;

  return (
    <div
      id="resume-print-area"
      className="resume-sheet mx-auto my-4 w-full max-w-[820px] bg-white text-[#333] shadow-2xl"
      onClick={(e) => e.stopPropagation()}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* 顶部深蓝条 */}
      <div className="h-3 w-full" style={{ background: NAVY }} />

      <div className="px-8 py-7 sm:px-12 sm:py-9">
        {/* 基本信息 */}
        {profile && (
          <Section icon="id" title={t("sectionBasic")}>
            <div className="flex items-start justify-between gap-6">
              <dl className="flex-1 space-y-2 text-[13.5px] leading-relaxed">
                <Field label={t("labelName")} value={profile.name} strong />
                <Field label={t("labelPhone")} value={profile.phone} />
                <Field label={t("labelEmail")} value={profile.email} />
                <Field label={t("labelBlog")} value={profile.blogUrl} />
                <Field label={t("labelCertificate")} value={profile.certificate} />
                <Field label={t("labelJobIntention")} value={profile.jobIntention} />
                <Field label={t("labelEdu")} value={profile.edu} />
              </dl>
              {profile.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-[150px] w-[115px] shrink-0 rounded-[4px] border border-[#e3e3e3] object-cover"
                />
              )}
            </div>
          </Section>
        )}

        {/* 专业技能 */}
        {skills.length > 0 && (
          <Section icon="skill" title={t("sectionSkills")}>
            <ol className="space-y-1.5 text-[13.5px] leading-relaxed">
              {skills.map((s, i) => (
                <li key={s.id} data-pdf-break={i > 0 ? "" : undefined} className="flex gap-2">
                  <span className="shrink-0 font-semibold" style={{ color: NAVY }}>
                    {i + 1}.
                  </span>
                  <span>{s.content}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* 工作经历 */}
        {experiences.length > 0 && (
          <Section icon="work" title={t("sectionExperience")}>
            <div className="space-y-5">
              {experiences.map((exp, idx) => (
                <div key={exp.id} data-pdf-break={idx > 0 ? "" : undefined}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="text-[13.5px] font-bold" style={{ color: NAVY }}>
                      {exp.period}
                    </span>
                    <span className="text-[13.5px] font-bold text-[#222]">{exp.company}</span>
                    <span className="text-[13.5px] font-bold" style={{ color: NAVY }}>
                      {exp.role}
                    </span>
                  </div>
                  {exp.highlights.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[13px] leading-relaxed text-[#444]">
                      {exp.highlights.map((h, i) => (
                        <li key={i} data-pdf-break={i > 0 ? "" : undefined} className="flex gap-2">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: NAVY }} />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 项目经验 */}
        {projects.length > 0 && (
          <Section icon="project" title={t("sectionProjects")}>
            <div className="space-y-5">
              {projects.map((proj, idx) => (
                <div key={proj.id} data-pdf-break={idx > 0 ? "" : undefined}>
                  <h4 className="text-[14px] font-bold text-[#222]">{proj.name}</h4>
                  {proj.summary && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[#444]">
                      <span className="font-semibold text-[#222]">{t("projectSummary")}：</span>
                      {proj.summary}
                    </p>
                  )}
                  {proj.contributions.length > 0 && (
                    <>
                      <p className="mt-2 text-[13px] font-semibold text-[#222]">
                        {t("projectContributions")}：
                      </p>
                      <ol className="mt-1 space-y-1 text-[13px] leading-relaxed text-[#444]">
                        {proj.contributions.map((c, i) => (
                          <li key={i} data-pdf-break={i > 0 ? "" : undefined} className="flex gap-2">
                            <span className="shrink-0 font-semibold" style={{ color: NAVY }}>
                              {i + 1}.
                            </span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

const NAVY = "#1f3a5f";

function Field({
  label,
  value,
  strong,
}: {
  label: string;
  value: string | null;
  strong?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-[#666]">{label}</dt>
      <dd className={strong ? "font-bold text-[#222]" : "text-[#333]"}>{value}</dd>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: "id" | "skill" | "work" | "project";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section data-pdf-break className="mb-7 break-inside-avoid last:mb-0">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2"
          style={{ borderColor: NAVY, color: NAVY }}
        >
          <SectionIcon name={icon} />
        </span>
        <h3 className="text-[16px] font-bold tracking-wide" style={{ color: NAVY }}>
          {title}
        </h3>
        <span className="h-[1px] flex-1" style={{ background: NAVY, opacity: 0.35 }} />
      </div>
      {children}
    </section>
  );
}

function SectionIcon({ name }: { name: "id" | "skill" | "work" | "project" }) {
  const common = { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;
  switch (name) {
    case "id":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3m-3 3h3M6 21v-2a4 4 0 014-4h0a4 4 0 014 4v2M3 5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25z" />
          <circle cx="10" cy="10" r="2" />
        </svg>
      );
    case "skill":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63" />
        </svg>
      );
    case "work":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      );
    case "project":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
        </svg>
      );
  }
}
