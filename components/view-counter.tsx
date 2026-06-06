"use client";

import { useEffect } from "react";
import { shouldIncrement } from "@/lib/view-counter/should-increment";
import { createClient } from "@/utils/supabase/client";

interface ViewCounterProps {
  postId: string;
}

export function ViewCounter({ postId }: ViewCounterProps): null {
  useEffect(() => {
    // 1. 爬虫守卫
    if (
      (navigator as any).webdriver === true ||
      /(bot|spider|crawler)/i.test(navigator.userAgent)
    ) {
      return;
    }

    // 2. sessionStorage 去重守卫
    const shouldRun = shouldIncrement(postId, Date.now(), {
      get: (k) => sessionStorage.getItem(k),
      set: (k, v) => sessionStorage.setItem(k, v),
    });
    if (!shouldRun) {
      return;
    }

    // 3. 调用 Supabase RPC（async IIFE，确保错误被静默吞掉）
    (async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.rpc("increment_view_count", {
          post_id: postId,
        });
        if (error) {
          console.warn("view-counter failed", error);
        }
      } catch (err) {
        console.warn("view-counter failed", err);
      }
    })();
  }, [postId]);

  return null;
}
