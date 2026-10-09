import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, ErrorState } from "@marketscope/ui";

type RemoteErrorBoundaryProps = {
  name: string;
  children: ReactNode;
};

type RemoteErrorBoundaryState = {
  error: Error | null;
};

export class RemoteErrorBoundary extends Component<
  RemoteErrorBoundaryProps,
  RemoteErrorBoundaryState
> {
  state: RemoteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RemoteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Remote "${this.props.name}" failed to load`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          action={
            <Button
              onClick={() => {
                // The host keeps a rejected container promise until the page loads again.
                window.location.reload();
              }}
              variant="secondary"
            >
              Retry
            </Button>
          }
          message="The shell is still running. This remote did not finish loading."
          title={`${this.props.name} failed to load`}
          titleAs="h1"
        />
      );
    }

    return this.props.children;
  }
}
