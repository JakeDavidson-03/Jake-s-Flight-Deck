import React, { useState, useRef, useEffect } from 'react';
import { searchAirports } from '../data/airports';

export default function AirportInput({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    const results = searchAirports(val);
    setSuggestions(results);
    setOpen(results.length > 0);
    if (val.length === 3) {
      const exact = results.find((a) => a.code.toLowerCase() === val.toLowerCase());
      if (exact) {
        onChange(exact.code);
        return;
      }
    }
    onChange(val.toUpperCase());
  };

  const handleSelect = (airport) => {
    setQuery(`${airport.city} (${airport.code})`);
    onChange(airport.code);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} style={styles.wrapper}>
      <input
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
        required
      />
      {open && (
        <ul style={styles.dropdown}>
          {suggestions.map((airport) => (
            <li
              key={airport.code}
              style={styles.option}
              onMouseDown={() => handleSelect(airport)}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#ebf4ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <span style={styles.code}>{airport.code}</span>
              <span style={styles.info}>
                {airport.city} — {airport.name}
              </span>
              <span style={styles.country}>{airport.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  wrapper: { position: 'relative', width: '100%' },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 15,
    color: '#1a202c',
    background: '#f7fafc',
    outline: 'none',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    listStyle: 'none',
    zIndex: 100,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxHeight: 240,
    overflowY: 'auto',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f4f8',
    background: '#fff',
    transition: 'background 0.1s',
  },
  code: {
    fontWeight: 700,
    fontSize: 14,
    color: '#1a56db',
    minWidth: 36,
  },
  info: {
    fontSize: 13,
    color: '#4a5568',
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  country: {
    fontSize: 12,
    color: '#a0aec0',
    fontWeight: 500,
  },
};
