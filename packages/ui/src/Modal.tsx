import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./Modal.module.css";
import { Button } from "./Button";

export function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog aria-labelledby={titleId} className={styles.dialog} onClose={onClose} ref={dialogRef}>
      <div className={styles.header}>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      </div>
      {children}
    </dialog>
  );
}
