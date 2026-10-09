import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "positive" | "negative" | "neutral";
  children: ReactNode;
}) {
  return <span className={[styles.badge, styles[tone]].join(" ")}>{children}</span>;
}
