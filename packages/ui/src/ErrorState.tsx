import type { ReactNode } from "react";
import styles from "./ErrorState.module.css";

export function ErrorState({
  title,
  message,
  action,
  titleAs: Title = "h2",
}: {
  title: string;
  message: string;
  action?: ReactNode;
  titleAs?: "h1" | "h2";
}) {
  return (
    <section className={styles.error} role="alert">
      <Title className={styles.title}>{title}</Title>
      <p className={styles.message}>{message}</p>
      {action}
    </section>
  );
}
