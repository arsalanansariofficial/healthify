'use client';

import { useMemo } from 'react';
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
  const color = useMemo(
    () => props.chartConfig[props.dataKey]?.color || 'var(--primary)',
    [props.chartConfig, props.dataKey]
  );

  return (
    <ChartContainer className={props.className} config={props.chartConfig}>
      <BarChart accessibilityLayer data={props.data}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey={props.xAxisKey}
          tickLine={false}
          tickMargin={10}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent payload={[]} />} />
        <Bar dataKey={props.dataKey} fill={color} radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
