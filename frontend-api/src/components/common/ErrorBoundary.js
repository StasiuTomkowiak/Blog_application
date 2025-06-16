// components/common/ErrorBoundary.js - No Modules Format
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-card">
                        <h1 className="error-title">Oops! Something went wrong</h1>
                        <p className="error-message">{this.state.error?.message}</p>
                        <button onClick={() => window.location.reload()} className="error-button">
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

window.ErrorBoundary = ErrorBoundary;