import { Button, Modal, simulateApiFault, simulateRemoteFault } from "@marketscope/ui";
import { useState } from "react";
import styles from "./DeveloperPanel.module.css";

const remotes = ["Markets", "Crypto", "Economy", "Watchlist"];

export function DeveloperPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={styles.trigger} onClick={() => setOpen(true)} type="button">
        Developer
      </button>
      <Modal onClose={() => setOpen(false)} open={open} title="Failure simulation">
        <p className={styles.copy}>
          Stop one remote to confirm the shell stays up. Clear the fault, then open that remote
          again or use Retry.
        </p>
        <div className={styles.actions}>
          {remotes.map((name) => (
            <Button
              key={name}
              onClick={() => simulateRemoteFault(name)}
              variant="secondary"
            >
              Stop {name}
            </Button>
          ))}
          <Button onClick={() => simulateRemoteFault(null)} variant="secondary">
            Clear remote fault
          </Button>
          <Button onClick={() => simulateApiFault("error")} variant="secondary">
            Fail the next API call
          </Button>
          <Button onClick={() => simulateApiFault("timeout")} variant="secondary">
            Time out the next API call
          </Button>
          <Button onClick={() => simulateApiFault(null)} variant="secondary">
            Clear API fault
          </Button>
        </div>
      </Modal>
    </>
  );
}
