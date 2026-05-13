import React, { useState } from 'react';
import axios from 'axios';

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatTime(datetime) {
  if (!datetime) return '';
  const d = new Date(datetime);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SKYSCANNER_CABIN = { '1': 'economy', '2': 'premiumeconomy', '3': 'business', '4': 'first' };

function buildSkyscannerUrl(flight, params) {
  const legs   = flight.flights || [];
  const first  = legs[0] || {};
  const last   = legs[legs.length - 1] || {};

  const from   = (first.departure_airport?.id || params?.departure_id || '').toLowerCase();
  const to     = (last.arrival_airport?.id    || params?.arrival_id   || '').toLowerCase();
  const date   = (params?.outbound_date || '').replace(/-/g, '');
  const ret    = (params?.return_date   || '').replace(/-/g, '');
  const adults = params?.adults || 1;
  const cabin  = SKYSCANNER_CABIN[params?.travel_class] || 'economy';

  const path = ret
    ? `https://www.skyscanner.com/transport/flights/${from}/${to}/${date}/${ret}/`
    : `https://www.skyscanner.com/transport/flights/${from}/${to}/${date}/`;

  return `${path}?adults=${adults}&cabinclass=${cabin}`;
}

export default function FlightCard({ flight, isBest, params }) {
  const [expanded, setExpanded] = useState(false);

  const handleBook = async () => {
    // Open a blank tab synchronously in the click handler. If we wait until after
    // the async API call, browsers treat window.open as a popup and block it —
    // which is why the old approach kept falling back to the generic Google Flights page.
    const newTab = window.open('', '_blank');

    const token = flight.booking_token;
    if (!token) {
      newTab.location.href = buildSkyscannerUrl(flight, params);
      return;
    }

    try {
      const res = await axios.get('/api/book', { params: { token } });
      const first = (res.data.booking_options || [])[0];

      if (!first?.booking_request) {
        newTab.location.href = buildSkyscannerUrl(flight, params);
        return;
      }

      const { url, method, parameters = {} } = first.booking_request;

      if (method === 'GET') {
        const fullUrl = new URL(url);
        Object.entries(parameters).forEach(([k, v]) => fullUrl.searchParams.set(k, v));
        newTab.location.href = fullUrl.toString();
      } else {
        // For POST bookings, write a self-submitting form into the pre-opened tab.
        // This works because about:blank is same-origin with the opener.
        const doc = newTab.document;
        const form = doc.createElement('form');
        form.method = 'POST';
        form.action = url;
        Object.entries(parameters).forEach(([k, v]) => {
          const input = doc.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = v;
          form.appendChild(input);
        });
        doc.body.appendChild(form);
        form.submit();
      }
    } catch {
      newTab.location.href = buildSkyscannerUrl(flight, params);
    }
  };
  const flights = flight.flights || [];
  const firstLeg = flights[0] || {};
  const lastLeg = flights[flights.length - 1] || {};
  const stops = flights.length - 1;

  return (
    <div style={{ ...styles.card, ...(isBest ? styles.bestCard : {}) }}>
      {isBest && <div style={styles.bestBadge}>Best Deal</div>}

      <div style={styles.main}>
        <div style={styles.times}>
          <div>
            <div style={styles.time}>{formatTime(firstLeg.departure_airport?.time)}</div>
            <div style={styles.airport}>{firstLeg.departure_airport?.id}</div>
          </div>
          <div style={styles.middle}>
            <div style={styles.duration}>{formatDuration(flight.total_duration)}</div>
            <div style={styles.line}>
              <div style={styles.dot} />
              <div style={styles.lineBar} />
              {stops > 0 && <div style={{ ...styles.dot, ...styles.stopDot }}>{stops}</div>}
              <div style={styles.lineBar} />
              <div style={styles.dot} />
            </div>
            <div style={styles.stopsLabel}>
              {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={styles.time}>{formatTime(lastLeg.arrival_airport?.time)}</div>
            <div style={styles.airport}>{lastLeg.arrival_airport?.id}</div>
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.price}>${flight.price?.toLocaleString()}</div>
          <div style={styles.airline}>{firstLeg.airline || ''}</div>
          <div style={styles.btnRow}>
            <button style={styles.detailsBtn} onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Hide details' : 'View details'}
            </button>
            <button onClick={handleBook} style={styles.bookBtn}>
              Book
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={styles.details}>
          {flights.map((leg, i) => (
            <div key={i} style={styles.leg}>
              <div style={styles.legHeader}>
                <strong>{leg.airline}</strong> · {leg.flight_number} · {leg.airplane}
              </div>
              <div style={styles.legRow}>
                <div>
                  <span style={styles.legTime}>{formatTime(leg.departure_airport?.time)}</span>
                  <span style={styles.legAirport}> {leg.departure_airport?.name} ({leg.departure_airport?.id})</span>
                </div>
                <div style={styles.legArrow}>→</div>
                <div>
                  <span style={styles.legTime}>{formatTime(leg.arrival_airport?.time)}</span>
                  <span style={styles.legAirport}> {leg.arrival_airport?.name} ({leg.arrival_airport?.id})</span>
                </div>
              </div>
              <div style={styles.legMeta}>
                Duration: {formatDuration(leg.duration)} · Class: {leg.travel_class || 'Economy'}
                {leg.legroom && ` · Legroom: ${leg.legroom}`}
              </div>
              {leg.extensions && (
                <div style={styles.legExtras}>{leg.extensions.join(' · ')}</div>
              )}
              {i < flights.length - 1 && flight.layovers?.[i] && (
                <div style={styles.layover}>
                  Layover at {flight.layovers[i].name} ({flight.layovers[i].id}) — {formatDuration(flight.layovers[i].duration)}
                </div>
              )}
            </div>
          ))}
          {flight.carbon_emissions && (
            <div style={styles.carbon}>
              CO₂: {Math.round(flight.carbon_emissions.this_flight / 1000)}kg
              {flight.carbon_emissions.difference_percent != null && (
                <span style={{ color: flight.carbon_emissions.difference_percent < 0 ? '#38a169' : '#e53e3e' }}>
                  {' '}({flight.carbon_emissions.difference_percent > 0 ? '+' : ''}{flight.carbon_emissions.difference_percent}% avg)
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    padding: '18px 20px',
    position: 'relative',
    transition: 'box-shadow 0.15s',
  },
  bestCard: { border: '1.5px solid #1a56db', boxShadow: '0 2px 12px rgba(26,86,219,0.1)' },
  bestBadge: {
    position: 'absolute',
    top: -1,
    left: 16,
    background: '#1a56db',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 10px',
    borderRadius: '0 0 6px 6px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  main: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  times: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 },
  time: { fontSize: 20, fontWeight: 700, color: '#1a202c' },
  airport: { fontSize: 13, color: '#718096', fontWeight: 500 },
  middle: { flex: 1, textAlign: 'center' },
  duration: { fontSize: 13, color: '#4a5568', marginBottom: 4 },
  line: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  lineBar: { flex: 1, height: 1.5, background: '#cbd5e0' },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#1a56db' },
  stopDot: {
    background: '#ed8936',
    color: '#fff',
    width: 18,
    height: 18,
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopsLabel: { fontSize: 12, color: '#718096', marginTop: 4 },
  right: { textAlign: 'right', minWidth: 100 },
  price: { fontSize: 24, fontWeight: 700, color: '#1a56db' },
  airline: { fontSize: 13, color: '#718096', marginBottom: 8 },
  btnRow: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' },
  detailsBtn: {
    background: 'none',
    border: '1.5px solid #cbd5e0',
    borderRadius: 6,
    padding: '5px 12px',
    fontSize: 13,
    color: '#4a5568',
    fontWeight: 500,
    cursor: 'pointer',
  },
  bookBtn: {
    display: 'block',
    background: '#1a56db',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '5px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%',
  },
  details: { borderTop: '1px solid #e2e8f0', marginTop: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 },
  leg: { display: 'flex', flexDirection: 'column', gap: 4 },
  legHeader: { fontSize: 13, color: '#4a5568' },
  legRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  legTime: { fontSize: 15, fontWeight: 600 },
  legAirport: { fontSize: 13, color: '#718096' },
  legArrow: { color: '#a0aec0', fontSize: 16 },
  legMeta: { fontSize: 12, color: '#a0aec0' },
  legExtras: { fontSize: 12, color: '#68d391' },
  layover: {
    background: '#fffbeb',
    border: '1px solid #f6e05e',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 12,
    color: '#744210',
    marginTop: 4,
  },
  carbon: { fontSize: 12, color: '#718096', borderTop: '1px solid #e2e8f0', paddingTop: 10 },
};
