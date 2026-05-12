import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import FlightResults from './components/FlightResults';
import axios from 'axios';

export default function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedParams, setSearchedParams] = useState(null);

  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setSearchedParams(params);

    try {
      const res = await axios.get('/api/flights', { params });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <span style={styles.logo}>✈ Jake's Flight Deck</span>
        </div>
      </header>

      <main style={styles.main}>
        <SearchForm onSearch={handleSearch} loading={loading} />

        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p>Searching flights...</p>
          </div>
        )}

        {results && !loading && (
          <FlightResults results={results} params={searchedParams} />
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f4f8' },
  header: {
    background: '#1a56db',
    padding: '16px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  headerInner: { maxWidth: 1100, margin: '0 auto' },
  logo: { color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 16px' },
  error: {
    background: '#fff5f5',
    border: '1px solid #fc8181',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#c53030',
    marginTop: 24,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginTop: 48,
    color: '#4a5568',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #1a56db',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);
