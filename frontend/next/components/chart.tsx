'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  ChartConfig,
  ChartLegend,
  ChartTooltip,
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent
} from '@/components/ui/chart';

type ChartData = Record<string, string | number>[];

type Props = {
  data: ChartData;
  dataKey: string;
  xAxisKey?: string;
  className?: string;
  chartConfig: ChartConfig;
};

export default function Chart(props: Props) {
  const color = props.chartConfig[props.dataKey]?.color || 'var(--primary)';

  return (
    <ChartContainer config={props.chartConfig} className={props.className}>
      <BarChart accessibilityLayer data={props.data}>
        <CartesianGrid vertical={false} />
        <XAxis
          tickMargin={10}
          tickLine={false}
          axisLine={false}
          dataKey={props.xAxisKey}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent payload={[]} />} />
        <Bar radius={4} dataKey={props.dataKey} fill={color} />
      </BarChart>
    </ChartContainer>
  );
}
