import styles from "./Skeleton.module.css";

export function Skeleton({ height = 16 }: { height?: number }) {
  return <div aria-hidden="true" className={styles.skeleton} style={{ height }} />;
}
