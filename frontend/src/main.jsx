import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Skyline सारथी App Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#031225',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Skyline सारथी Application Notice
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
