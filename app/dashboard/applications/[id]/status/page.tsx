"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusForm } from "../status-form";

const STATUS_OPTIONS = [
  { value: "applied", label: "Đã ứng tuyển" },
  { value: "screening", label: "Sàng lọc" },
  { value: "interviewing", label: "Phỏng vấn" },
  { value: "offered", label: "Đã gửi offer" },
  { value: "hired", label: "Đã tuyển" },
  { value: "rejected", label: "Từ chối" },
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ApplicationStatusPage(props: PageProps) {
  const params = React.use(props.params);
  const appId = params.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "applications", appId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/applications/${appId}`);
      if (!res.ok) throw new Error("Không thể tải thông tin đơn.");
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-12 text-center text-muted-foreground">
        Đang tải thông tin đơn ứng tuyển...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-12 text-center text-destructive">
        Không thể tải thông tin đơn ứng tuyển.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/applications/${appId}`}
          className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          ← Quay lại hồ sơ 360°
        </Link>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-xl">Đổi trạng thái đơn ứng tuyển</CardTitle>
          <CardDescription className="text-sm">
            Ứng viên: <strong>{data.users?.fullName}</strong> · Vị trí: <strong>{data.jobs?.title}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusForm
            applicationId={data.id}
            currentStatus={data.status}
            statusOptions={STATUS_OPTIONS}
          />
        </CardContent>
      </Card>
    </div>
  );
}
