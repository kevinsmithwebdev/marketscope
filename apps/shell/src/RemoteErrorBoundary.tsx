import { Component, type ErrorInfo, type ReactNode } from "react";

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
        <section role="alert">
          <h1>{this.props.name} failed to load</h1>
          <p>The shell is still running. This remote did not finish loading.</p>
          <button
            type="button"
            onClick={() => {
              // The host keeps a rejected container promise until the page loads again.
              window.location.reload();
            }}
          >
            Retry
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
