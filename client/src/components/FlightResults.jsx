import React, { useState } from 'react';
import FlightCard from './FlightCard';

export default function FlightResults({ results, params }) {
  const [sortBy, setSortBy] = useState('best');

  const allFlights = [
    ...results.best_flights.map((f) => ({ ...f, _isBest: true })),
    ...results.other_flights,
  ];

  const sorted = [...allFlights].sort((a, b) => {
    if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'duration') return (a.total_duration || 0) - (b.total_duration || 0);
    if (sortBy === 'time') {
      const aTime = a.flights?.[0]?.departure_airport?.time || '';
      const bTime = b.flights?.[0]?.departure_airport?.time || '';
      return aTime.localeCompare(bTime);
    }
    return 0;
  });

  const total = allFlights.length;
  const insights = results.price_insights;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            {params.departure_id} → {params.arrival_id}
          </h2>
          <p style={styles.subtitle}>{total} flight{total !== 1 ? 's' : ''} found</p>
        </div>
        <div style={styles.sortRow}>
          <span style={styles.sortLabel}>Sort by:</span>
          {['best', 'price', 'duration', 'time'].map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{ ...styles.sortBtn, ...(sortBy === s ? styles.sortActive : {}) }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {insights && (
        <div style={styles.insights}>
          <span style={styles.insightsIcon}>💡</span>
          <span>
            Typical price range for this route: <strong>${insights.lowest_price?.toLocaleString()}</strong>
            {' – '}
            <strong>${insights.highest_price?.toLocaleString()}</strong>
            {insights.price_level && ` · Prices are currently ${insights.price_level.toLowerCase()}`}
          </span>
        </div>
      )}

      {total === 0 ? (
        <div style={styles.empty}>No flights found. Try adjusting your search.</div>
      ) : (
        <div style={styles.list}>
          {sorted.map((flight, i) => (
            <FlightCard key={i} flight={flight} isBest={flight._isBest && sortBy === 'best' && i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { marginTop: 28 },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 700, color: '#1a202c' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 2 },
  sortRow: { display: 'flex', alignItems: 'center', gap: 8 },
  sortLabel: { fontSize: 13, color: '#718096', fontWeight: 500 },
  sortBtn: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1.5px solid #cbd5e0',
    background: '#fff',
    fontSize: 13,
    color: '#4a5568',
    fontWeight: 500,
  },
  sortActive: { background: '#1a56db', border: '1.5px solid #1a56db', color: '#fff' },
  insights: {
    background: '#ebf8ff',
    border: '1px solid #bee3f8',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    color: '#2c5282',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  insightsIcon: { fontSize: 16 },
  empty: {
    textAlign: 'center',
    padding: 48,
    color: '#718096',
    fontSize: 16,
    background: '#fff',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
};
