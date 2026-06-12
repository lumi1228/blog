"use client";

import { useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { ColumnsLeftPanel } from "@/components/admin/columns-left-panel";
import { ColumnsRightPanel } from "@/components/admin/columns-right-panel";

// ─── 类型定义 ──────────────────────────────────────────────────────────────────

export interface Column {
  id: string;
  slug: string;
  sort: number;
  title_zh: string;
  title_en: string | null;
  description_zh: string | null;
  description_en: string | null;
  cover_image: string | null;
  articleCount: number;
}

export interface Chapter {
  id: string;
  column_id: string;
  sort: number;
  title_zh: string;
  title_en: string | null;
}

export interface Post {
  id: string;
  slug: string;
  status: string;
  created_at: string;
  column_order: number | null;
  chapter_id: string | null;
  title_zh: string;
  title_en: string | null;
  post_tags: { tags: { name_zh: string } | null }[] | null;
}

interface ColumnsWorkspaceProps {
  columns: Column[];
  initialColumnId: string | null;
  initialChapters: Chapter[];
  initialChapterId: string | null;
  initialPosts: Post[];
}

// ─── 主容器 ────────────────────────────────────────────────────────────────────

export function ColumnsWorkspace({
  columns: initialColumns,
  initialColumnId,
  initialChapters,
  initialChapterId,
  initialPosts,
}: ColumnsWorkspaceProps) {
  // 专栏列表（支持 Optimistic Update）
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  // 选中状态
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(initialColumnId);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(initialChapterId);

  // 右栏文章数据
  const [rightPosts, setRightPosts] = useState<Post[]>(initialPosts);
  const [rightLoading, setRightLoading] = useState(false);

  // ── 三层缓存（useRef，不触发重渲染）──────────────────────────────────────────
  // 章节缓存：columnId → Chapter[]
  const chapterCache = useRef<Map<string, Chapter[]>>(new Map());
  // 章节加载状态缓存：columnId → 'loading' | 'loaded' | 'error'
  const chapterLoadState = useRef<Map<string, "loading" | "loaded" | "error">>(new Map());
  // 文章缓存：`${columnId}:${chapterId ?? 'ungrouped'}` → Post[]
  const postCache = useRef<Map<string, Post[]>>(new Map());

  // 预填第一个专栏的章节数据
  if (initialColumnId && initialChapters.length > 0 && !chapterCache.current.has(initialColumnId)) {
    chapterCache.current.set(initialColumnId, initialChapters);
    chapterLoadState.current.set(initialColumnId, "loaded");
  }
  // 预填第一个章节的文章缓存
  if (initialColumnId) {
    const key = `${initialColumnId}:${initialChapterId ?? "ungrouped"}`;
    if (!postCache.current.has(key)) {
      postCache.current.set(key, initialPosts);
    }
  }

  // ── 文章缓存失效 ──────────────────────────────────────────────────────────────
  const invalidatePostCache = useCallback((columnId: string, chapterId: string | null) => {
    const key = `${columnId}:${chapterId ?? "ungrouped"}`;
    postCache.current.delete(key);
  }, []);

  // ── 加载文章 ──────────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async (columnId: string, chapterId: string | null) => {
    const key = `${columnId}:${chapterId ?? "ungrouped"}`;

    // 命中缓存
    if (postCache.current.has(key)) {
      setRightPosts(postCache.current.get(key)!);
      return;
    }

    setRightLoading(true);
    const supabase = createClient();
    const query = supabase
      .from("posts")
      .select("id, slug, status, created_at, column_order, chapter_id, title_zh, title_en, post_tags(tags(name_zh))")
      .eq("column_id", columnId)
      .order("column_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (chapterId !== null) {
      query.eq("chapter_id", chapterId);
    } else {
      query.is("chapter_id", null);
    }

    const { data, error } = await query;
    setRightLoading(false);

    if (!error && data) {
      const posts = data as unknown as Post[];
      postCache.current.set(key, posts);
      setRightPosts(posts);
    }
  }, []);

  // ── 加载章节 ──────────────────────────────────────────────────────────────────
  const [, forceUpdate] = useState(0);

  const loadChapters = useCallback(
    async (columnId: string) => {
      if (chapterCache.current.has(columnId)) return chapterCache.current.get(columnId)!;

      chapterLoadState.current.set(columnId, "loading");
      forceUpdate((n) => n + 1);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("column_chapters")
        .select("id, column_id, sort, title_zh, title_en")
        .eq("column_id", columnId)
        .order("sort", { ascending: true });

      if (error) {
        chapterLoadState.current.set(columnId, "error");
        forceUpdate((n) => n + 1);
        return [];
      }

      const chapters = data ?? [];
      chapterCache.current.set(columnId, chapters);
      chapterLoadState.current.set(columnId, "loaded");
      forceUpdate((n) => n + 1);
      return chapters;
    },
    []
  );

  // ── 选中章节 ──────────────────────────────────────────────────────────────────
  const handleSelectChapter = useCallback(
    async (columnId: string, chapterId: string | null) => {
      setSelectedColumnId(columnId);
      setSelectedChapterId(chapterId);
      await loadPosts(columnId, chapterId);
    },
    [loadPosts]
  );

  // ── 展开专栏（懒加载章节）────────────────────────────────────────────────────
  const handleExpandColumn = useCallback(
    async (columnId: string) => {
      const chapters = await loadChapters(columnId);
      // 展开后自动选中第一个章节（如果当前专栏不是已选中的）
      if (columnId !== selectedColumnId && chapters.length > 0) {
        setSelectedColumnId(columnId);
        const firstChapterId = chapters[0]?.id ?? null;
        setSelectedChapterId(firstChapterId);
        await loadPosts(columnId, firstChapterId);
      } else if (columnId !== selectedColumnId) {
        setSelectedColumnId(columnId);
        setSelectedChapterId(null);
        await loadPosts(columnId, null);
      }
    },
    [loadChapters, loadPosts, selectedColumnId]
  );

  // ── Optimistic：专栏 CRUD ─────────────────────────────────────────────────────
  const handleColumnMutate = useCallback(
    (type: "add" | "update" | "delete", payload: Partial<Column> & { id: string }) => {
      setColumns((prev) => {
        if (type === "add") {
          return [...prev, payload as Column];
        }
        if (type === "update") {
          return prev.map((c) => (c.id === payload.id ? { ...c, ...payload } : c));
        }
        if (type === "delete") {
          return prev.filter((c) => c.id !== payload.id);
        }
        return prev;
      });
    },
    []
  );

  // ── Optimistic：专栏拖拽重排 ──────────────────────────────────────────────────
  const handleColumnReorder = useCallback((reordered: Column[]) => {
    setColumns(reordered);
  }, []);

  // ── Optimistic：章节 CRUD ─────────────────────────────────────────────────────
  const handleChapterMutate = useCallback(
    (
      columnId: string,
      type: "add" | "update" | "delete",
      payload: Partial<Chapter> & { id: string }
    ) => {
      const current = chapterCache.current.get(columnId) ?? [];

      if (type === "add") {
        const next = [...current, payload as Chapter];
        chapterCache.current.set(columnId, next);
      } else if (type === "update") {
        const next = current.map((c) => (c.id === payload.id ? { ...c, ...payload } : c));
        chapterCache.current.set(columnId, next);
        if (payload.id === selectedChapterId) {
          forceUpdate((n) => n + 1);
        }
      } else if (type === "delete") {
        const next = current.filter((c) => c.id !== payload.id);
        chapterCache.current.set(columnId, next);
        invalidatePostCache(columnId, payload.id);
        if (payload.id === selectedChapterId) {
          const fallback = next[0] ?? null;
          const fallbackId = fallback?.id ?? null;
          setSelectedChapterId(fallbackId);
          loadPosts(columnId, fallbackId);
        }
      }

      forceUpdate((n) => n + 1);
    },
    [selectedChapterId, invalidatePostCache, loadPosts]
  );

  // ── Optimistic：章节拖拽重排 ──────────────────────────────────────────────────
  const handleChapterReorder = useCallback((columnId: string, reordered: Chapter[]) => {
    chapterCache.current.set(columnId, reordered);
    forceUpdate((n) => n + 1);
  }, []);

  // ── 当前专栏和章节 ────────────────────────────────────────────────────────────
  const selectedColumn = columns.find((c) => c.id === selectedColumnId) ?? null;
  const currentChapters = selectedColumnId
    ? chapterCache.current.get(selectedColumnId) ?? []
    : [];
  const selectedChapter = currentChapters.find((c) => c.id === selectedChapterId) ?? null;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* 左栏 */}
      <div className="w-[280px] shrink-0 overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <ColumnsLeftPanel
          columns={columns}
          chapterCache={chapterCache.current}
          chapterLoadState={chapterLoadState.current}
          selectedColumnId={selectedColumnId}
          selectedChapterId={selectedChapterId}
          onExpandColumn={handleExpandColumn}
          onSelectChapter={handleSelectChapter}
          onColumnMutate={handleColumnMutate}
          onColumnReorder={handleColumnReorder}
          onChapterMutate={handleChapterMutate}
          onChapterReorder={handleChapterReorder}
        />
      </div>

      {/* 右栏 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ColumnsRightPanel
          selectedColumn={selectedColumn}
          selectedChapter={selectedChapter}
          posts={rightPosts}
          loading={rightLoading}
          onPostsMutated={() => {
            if (selectedColumnId) invalidatePostCache(selectedColumnId, selectedChapterId);
          }}
        />
      </div>
    </div>
  );
}
