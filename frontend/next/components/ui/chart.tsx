'use client';

import { Legend, ResponsiveContainer, Tooltip } from 'recharts';

import {
  Payload,
  NameType,
  ValueType
} from 'recharts/types/component/DefaultTooltipContent';

import {
  useId,
  useMemo,
  ReactNode,
  useContext,
  ComponentType,
  createContext,
  CSSProperties,
  ComponentProps
} from 'react';

import { cn } from '@/lib/utils';

const THEMES = { light: '', dark: '.dark' } as const;
export const ChartLegend = Legend;
export const ChartTooltip = Tooltip;
export const ChartContext = createContext<ChartContextProps | null>(null);

type ChartContextProps = { config: ChartConfig };
type ChartStyleProps = { id: string; config: ChartConfig };

export type ChartConfig = {
  [k in string]: { label?: ReactNode; icon?: ComponentType } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContainerProps = ComponentProps<'div'> & {
  config: ChartConfig;
  children: ComponentProps<typeof ResponsiveContainer>['children'];
};

type ChartTooltipContentProps = ComponentProps<typeof Tooltip> &
  ComponentProps<'div'> & {
    label?: string;
    nameKey?: string;
    labelKey?: string;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    payload?: readonly Payload<ValueType, NameType>[];
  };

type CharLegendContentProps = ComponentProps<'div'> & {
  nameKey?: string;
  hideIcon?: boolean;
  verticalAlign?: 'top' | 'bottom' | 'middle';
  payload?: {
    type?: string;
    color?: string;
    id?: string | number;
    value: string | number;
    dataKey?: string | number;
    payload: Record<string, string>;
  }[];
};

export function useChart() {
  const context = useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

export function ChartContainer(props: ChartContainerProps) {
  const uniqueId = useId();
  const chartId = `chart-${props.id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config: props.config }}>
      <div
        {...props}
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          props.className
        )}
      >
        <ChartStyle id={chartId} config={props.config} />
        <ResponsiveContainer>{props.children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartStyle({ id, config }: ChartStyleProps) {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `${prefix} [data-chart=${id}] {
                ${colorConfig
                  .map(([key, itemConfig]) => {
                    const color =
                      itemConfig.theme?.[
                        theme as keyof typeof itemConfig.theme
                      ] || itemConfig.color;
                    return color ? `  --color-${key}: ${color};` : null;
                  })
                  .join('\n')}
              }`
          )
          .join('\n')
      }}
    />
  );
}

export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  let payloadPayload;
  let configLabelKey: string = key;
  if (typeof payload !== 'object' || payload === null) return undefined;

  if (
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload
  ) {
    payloadPayload = payload.payload;
  }

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  }

  if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  if (configLabelKey in config) return config[configLabelKey];
  return config[key as keyof typeof config];
}

export function ChartLegendContent(props: CharLegendContentProps) {
  const { config } = useChart();
  const { hideIcon = false, verticalAlign = 'bottom' } = props;

  if (!props.payload?.length) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        props.className
      )}
    >
      {props.payload.map(item => {
        const key = `${props.nameKey || item.dataKey || 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn(
              '[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3'
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

export function ChartTooltipContent(props: ChartTooltipContentProps) {
  const { config } = useChart();
  const { indicator = 'dot', hideLabel = false, hideIndicator = false } = props;

  const tooltipLabel = useMemo(() => {
    if (hideLabel || !props.payload?.length) return null;

    const [item] = props.payload;
    const key = `${props.labelKey || item?.dataKey || item?.name || 'value'}`;

    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    let value = itemConfig?.label;

    if (!props.labelKey && typeof props.label === 'string') {
      value = config[props.label as keyof typeof config]?.label || props.label;
    }

    if (props.labelFormatter) {
      return (
        <div className={cn('font-medium', props.labelClassName)}>
          {props.labelFormatter(value, props.payload)}
        </div>
      );
    }

    if (!value) return null;

    return (
      <div className={cn('font-medium', props.labelClassName)}>{value}</div>
    );
  }, [props, config, hideLabel]);

  if (!props.active || !props.payload?.length) {
    return null;
  }

  const nestLabel = props.payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={cn(
        'border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl',
        props.className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {props.payload.map((item, index) => {
          const key = `${props.nameKey || item.name || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = props.color || item.payload.fill || item.color;

          return (
            <div
              key={item.dataKey as string}
              className={cn(
                '[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
                indicator === 'dot' && 'items-center'
              )}
            >
              {props.formatter && item?.value && item.name ? (
                props.formatter(
                  item.value,
                  item.name,
                  item,
                  index,
                  item.payload
                )
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
                          {
                            'h-2.5 w-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent':
                              indicator === 'dashed',
                            'my-0.5': nestLabel && indicator === 'dashed'
                          }
                        )}
                        style={
                          {
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor
                          } as CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      'flex flex-1 justify-between leading-none',
                      nestLabel ? 'items-end' : 'items-center'
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
