import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartTheme } from "./chartTheme";
import styles from "./LineSeriesChart.module.css";

type ChartPoint = Record<string, string | number | null>;

export function LineSeriesChart({
  data,
  dataKey,
  height = 320,
  width = "100%",
  yAxisWidth = 72,
  showAxes = true,
  tickFormatter,
  labelFormatter,
}: {
  data: ChartPoint[];
  dataKey: string;
  height?: number;
  width?: number | string;
  yAxisWidth?: number;
  showAxes?: boolean;
  tickFormatter?: (value: unknown) => string;
  labelFormatter?: (value: unknown) => string;
}) {
  return (
    <div className={styles.chart} style={{ height, width }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          {showAxes ? (
            <>
              <CartesianGrid stroke={chartTheme.grid} />
              <XAxis
                dataKey="date"
                minTickGap={32}
                stroke={chartTheme.axis}
                tick={chartTheme.tick}
                tickFormatter={tickFormatter}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke={chartTheme.axis}
                tick={chartTheme.tick}
                width={yAxisWidth}
              />
              <Tooltip
                contentStyle={chartTheme.tooltip.contentStyle}
                cursor={chartTheme.tooltip.cursor}
                itemStyle={chartTheme.tooltip.itemStyle}
                labelFormatter={labelFormatter}
                labelStyle={chartTheme.tooltip.labelStyle}
              />
            </>
          ) : null}
          <Line
            animationDuration={500}
            dataKey={dataKey}
            dot={false}
            stroke={chartTheme.line}
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
