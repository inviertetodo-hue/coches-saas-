import { Component } from "react";

import AppErrorFallback from "./AppErrorFallback";

export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error) {
    console.error("Route rendering error:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <AppErrorFallback onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}