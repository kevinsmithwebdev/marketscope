import type { CSSProperties } from "react";

const border = "var(--ms-border, #e1e7f0)";
const muted = "var(--ms-muted, #5c6b82)";

/** SVG attributes do not inherit CSS color, so charts read the same tokens directly. */
export const chartTheme = {
  grid: border,
  line: "var(--ms-accent, #1d4ed8)",
  axis: border,
  tick: { fill: muted },
  tooltip: {
    contentStyle: {
      background: "var(--ms-surface, #ffffff)",
      border: `1px solid ${border}`,
      borderRadius: 8,
      color: "var(--ms-text, #172033)",
    } satisfies CSSProperties,
    labelStyle: { color: muted } satisfies CSSProperties,
    itemStyle: { color: "var(--ms-text, #172033)" } satisfies CSSProperties,
    cursor: { stroke: muted },
  },
};
