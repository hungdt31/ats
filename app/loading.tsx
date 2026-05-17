"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export default function GlobalLoading() {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Tạo hiệu ứng progress bar chạy dần đến 90%
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) {
          return oldProgress;
        }
        const diff = Math.random() * 10 + 2;
        return Math.min(oldProgress + diff, 90);
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 px-4">
      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        <div className="text-sm font-medium text-muted-foreground animate-pulse">
          Đang tải trang...
        </div>
        <Progress value={progress} className="h-1.5 w-full bg-muted/60" />
      </div>
    </div>
  );
}
