import React from 'react';

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
                <div
                    style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#fff',
                        backgroundColor: '#131722'
                    }}
                >
                    <h2>Something went wrong</h2>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()}>
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
