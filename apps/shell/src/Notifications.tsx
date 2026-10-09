import { useEffect, useState, type ReactNode } from "react";
import styles from "./Notifications.module.css";

type Notice = {
  id: number;
  message: string;
};

export function Notifications({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    function onNotify(event: Event) {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (!detail?.message) {
        return;
      }

      const message = detail.message;
      setNotices((current) => [...current, { id: Date.now(), message }].slice(-3));
    }

    window.addEventListener("marketscope.notify", onNotify);
    return () => window.removeEventListener("marketscope.notify", onNotify);
  }, []);

  return (
    <>
      {notices.length > 0 ? (
        <div aria-live="polite" className={styles.region}>
          {notices.map((notice) => (
            <p className={styles.notice} key={notice.id}>
              {notice.message}
            </p>
          ))}
        </div>
      ) : null}
      {children}
    </>
  );
}
