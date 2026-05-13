import React, { useState } from 'react';
import AirportInput from './AirportInput';

const POPULAR_AIRLINES = [
  { code: '', name: 'Any Airline' },
  { code: 'AA', name: 'American Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'WN', name: 'Southwest Airlines' },
  { code: 'B6', name: 'JetBlue Airways' },
  { code: 'AS', name: 'Alaska Airlines' },
  { code: 'NK', name: 'Spirit Airlines' },
  { code: 'F9', name: 'Frontier Airlines' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
];

const today = new Date().toISOString().split('T')[0];

export default function SearchForm({ onSearch, loading }) {
  const [tripType, setTripType] = useState('roundtrip');
  const [form, setForm] = useState({
    departure_id: '',
    arrival_id: '',
    outbound_date: '',
    return_date: '',
    adults: 1,
    stops: '',
    travel_class: '',
    airline: '',
    currency: 'USD',
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = { ...form };
    if (tripType === 'oneway') delete params.return_date;
    onSearch(params);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.card}>
      <div style={styles.tripToggle}>
        {['roundtrip', 'oneway'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTripType(t)}
            style={{ ...styles.toggleBtn, ...(tripType === t ? styles.toggleActive : {}) }}
          >
            {t === 'roundtrip' ? 'Round Trip' : 'One Way'}
          </button>
        ))}
      </div>

      <div style={styles.row}>
        <Field label="From">
          <AirportInput
            value={form.departure_id}
            onChange={(val) => set('departure_id', val)}
            placeholder="City or airport (e.g. New York)"
          />
        </Field>
        <Field label="To">
          <AirportInput
            value={form.arrival_id}
            onChange={(val) => set('arrival_id', val)}
            placeholder="City or airport (e.g. Los Angeles)"
          />
        </Field>
      </div>

      <div style={styles.row}>
        <Field label="Departure Date">
          <input
            type="date"
            style={styles.input}
            min={today}
            value={form.outbound_date}
            onChange={(e) => set('outbound_date', e.target.value)}
            required
          />
        </Field>
        {tripType === 'roundtrip' && (
          <Field label="Return Date">
            <input
              type="date"
              style={styles.input}
              min={form.outbound_date || today}
              value={form.return_date}
              onChange={(e) => set('return_date', e.target.value)}
              required={tripType === 'roundtrip'}
            />
          </Field>
        )}
        <Field label="Passengers">
          <select style={styles.input} value={form.adults} onChange={(e) => set('adults', e.target.value)}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
            ))}
          </select>
        </Field>
      </div>

      <div style={styles.row}>
        <Field label="Stops">
          <select style={styles.input} value={form.stops} onChange={(e) => set('stops', e.target.value)}>
            <option value="">Any</option>
            <option value="0">Non-stop only</option>
            <option value="1">1 stop or fewer</option>
          </select>
        </Field>
        <Field label="Cabin Class">
          <select style={styles.input} value={form.travel_class} onChange={(e) => set('travel_class', e.target.value)}>
            <option value="">Any</option>
            <option value="1">Economy</option>
            <option value="2">Economy Plus</option>
            <option value="3">Business</option>
            <option value="4">First</option>
          </select>
        </Field>
        <Field label="Airline">
          <select style={styles.input} value={form.airline} onChange={(e) => set('airline', e.target.value)}>
            {POPULAR_AIRLINES.map((a) => (
              <option key={a.code} value={a.code}>{a.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Currency">
          <select style={styles.input} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
            {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <button type="submit" disabled={loading} style={{ ...styles.submit, ...(loading ? styles.submitDisabled : {}) }}>
        {loading ? 'Searching...' : 'Search Flights'}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ flex: 1, minWidth: 160 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 28,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  tripToggle: { display: 'flex', gap: 8 },
  toggleBtn: {
    padding: '8px 18px',
    borderRadius: 20,
    border: '1.5px solid #cbd5e0',
    background: '#fff',
    color: '#4a5568',
    fontWeight: 500,
    fontSize: 14,
    transition: 'all 0.15s',
  },
  toggleActive: {
    background: '#1a56db',
    border: '1.5px solid #1a56db',
    color: '#fff',
  },
  row: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 15,
    color: '#1a202c',
    background: '#f7fafc',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  submit: {
    background: '#1a56db',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '13px 0',
    fontSize: 16,
    fontWeight: 600,
    width: '100%',
    transition: 'background 0.15s',
  },
  submitDisabled: { background: '#a0aec0' },
};
