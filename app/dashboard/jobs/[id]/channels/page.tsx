"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const CHANNELS_OPTIONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "itviec", label: "ITViec" },
  { value: "topcv", label: "TopCV" },
  { value: "vietnamworks", label: "VietnamWorks" },
  { value: "website", label: "Website nội bộ" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Đang chờ (Pending)", variant: "outline" as const },
  { value: "posted", label: "Đã đăng (Posted)", variant: "default" as const },
  { value: "failed", label: "Thất bại (Failed)", variant: "destructive" as const },
  { value: "expired", label: "Hết hạn (Expired)", variant: "secondary" as const },
  { value: "removed", label: "Đã gỡ (Removed)", variant: "destructive" as const },
];

type Params = Promise<{ id: string }>;

export default function JobChannelsPage(props: { params: Params }) {
  const router = useRouter();
  const params = React.use(props.params);
  const jobId = params.id;

  const [channel, setChannel] = useState("linkedin");
  const [externalUrl, setExternalUrl] = useState("");
  const [externalId, setExternalId] = useState("");
  const [status, setStatus] = useState("posted");
  const [isPending, setIsPending] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard", "jobs", jobId, "channels"],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/jobs/${jobId}/channels`);
      if (!res.ok) throw new Error("Không thể tải thông tin.");
      const json = await res.json();
      return json.data as {
        channels: any[];
        job: any;
      };
    },
  });

  const channels = data?.channels || [];
  const job = data?.job || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel || !status) {
      toast.error("Vui lòng chọn kênh và trạng thái.");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch(`/api/dashboard/jobs/${jobId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          external_url: externalUrl,
          external_id: externalId,
          status,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Lỗi lưu kênh tuyển dụng.");
      }

      toast.success("Cập nhật kênh tuyển dụng thành công!");
      setChannel("linkedin");
      setExternalUrl("");
      setExternalId("");
      setStatus("posted");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.");
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-12 text-center text-muted-foreground">
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/jobs"
          className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted transition-all gap-1.5 cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01FreeIcons} className="size-3.5" /> Quay lại danh sách
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Form column */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Thêm / Sửa Channel</CardTitle>
              <CardDescription className="text-xs">
                Cập nhật thông tin đăng tin của từng kênh.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Kênh tuyển dụng</label>
                  <Select value={channel} onValueChange={(val) => setChannel(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn kênh" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {CHANNELS_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Trạng thái đăng tuyển</label>
                  <Select value={status} onValueChange={(val) => setStatus(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {STATUS_OPTIONS.map((st) => (
                        <SelectItem key={st.value} value={st.value}>
                          {st.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Link bài viết (External URL)</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="rounded-2xl h-10 px-3 border border-input/60 bg-background text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">ID bài viết bên ngoài (External ID)</label>
                  <Input
                    type="text"
                    placeholder="Ví dụ: job-12345..."
                    value={externalId}
                    onChange={(e) => setExternalId(e.target.value)}
                    className="rounded-2xl h-10 px-3 border border-input/60 bg-background text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer w-full"
                  >
                    {isPending ? "Đang lưu..." : "Lưu channel"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Table column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Danh sách các kênh đăng tin</CardTitle>
                <CardDescription className="text-xs">
                  Vị trí: <strong>{job?.title || "—"}</strong>
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-normal text-xs px-2.5 py-0.5">
                Tổng: {channels.length}
              </Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-secondary">
                  <TableRow>
                    <TableHead>Kênh (Channel)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thông tin chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-xs">
                        Chưa đăng tin lên bất kỳ kênh nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    channels.map((ch: any) => {
                      const statusConfig =
                        STATUS_OPTIONS.find((s) => s.value === ch.status) || STATUS_OPTIONS[0];
                      const channelLabel =
                        CHANNELS_OPTIONS.find((c) => c.value === ch.channel)?.label || ch.channel;
                      return (
                        <TableRow key={ch.id}>
                          <TableCell>
                            <span className="font-bold text-foreground capitalize text-sm">
                              {channelLabel}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs gap-0.5">
                              {ch.external_id && (
                                <span className="text-muted-foreground">
                                  ID: <strong className="text-foreground">{ch.external_id}</strong>
                                </span>
                              )}
                              {ch.external_url && (
                                <a
                                  href={ch.external_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline break-all"
                                >
                                  Xem tin đăng
                                </a>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
