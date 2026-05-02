"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ChartsProps = {
  activeJobsCount: number;
  newApplicationsCount: number;
  scheduledInterviewsCount: number;
};

export function DashboardCharts({
  activeJobsCount,
  newApplicationsCount,
  scheduledInterviewsCount,
}: ChartsProps) {
  const chartData = [
    { name: "Tin tuyển dụng", count: activeJobsCount },
    { name: "Đơn ứng tuyển", count: newApplicationsCount },
    { name: "Phỏng vấn", count: scheduledInterviewsCount },
  ];

  const chartConfig = {
    count: {
      label: "Số lượng",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-lg">Biểu đồ tổng quan</CardTitle>
        <CardDescription className="text-xs">
          So sánh trực quan các chỉ số KPI hiện tại.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[220px] max-h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid vertical={false} className="stroke-border/40" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              className="text-xs fill-muted-foreground font-medium"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-xs fill-muted-foreground font-medium"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[12, 12, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
