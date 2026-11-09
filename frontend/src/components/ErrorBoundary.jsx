import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="runtime-error" role="alert">
          <div className="eyebrow">GLOBALTALK</div>
          <h1>Something went wrong</h1>
          <p>The page could not be displayed. Refresh to try again.</p>
          <button className="button primary" onClick={() => window.location.reload()}>
            Refresh page
          </button>
          <a href="/">Go to GlobalTalk home</a>
        </main>
      );
    }

    return this.props.children;
  }
}
