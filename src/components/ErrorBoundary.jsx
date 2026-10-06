import { Component } from 'react';

/**
 * Catches render errors (and failed lazy-chunk loads after a redeploy) so the
 * visitor sees a recovery screen instead of a blank page.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[app]', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-6 text-center" role="alert">
        <p className="font-display text-6xl uppercase">Oops</p>
        <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted">Please reload the page. If it keeps happening, try again in a minute.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper"
        >
          Reload page
        </button>
      </div>
    );
  }
}
