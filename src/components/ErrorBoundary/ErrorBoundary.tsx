import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unexpected application error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-surface-muted p-6">
          <section
            aria-labelledby="error-boundary-title"
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm"
          >
            <p className="mb-2 text-sm font-medium text-muted">Błąd aplikacji</p>
            <h1
              id="error-boundary-title"
              className="text-2xl font-semibold text-foreground"
            >
              Coś poszło nie tak
            </h1>
            <p className="mt-3 text-muted">
              Wystąpił nieoczekiwany problem. Odśwież stronę i spróbuj ponownie.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Odśwież stronę
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
