import React, { useState } from 'react';

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

const DELTA_CABIN  = { '1': 'COACH', '2': 'PREMIUM_SELECT', '3': 'BUSINESS_ELITE', '4': 'FIRST_CLASS' };
const AA_CABIN     = { '1': 'COACH', '2': 'PREMIUM_ECONOMY', '3': 'BUSINESS', '4': 'FIRST' };
const UA_CABIN     = { '1': '7', '2': '9', '3': '8', '4': '6' };

function buildAirlineUrl(flight, params) {
  const legs = flight.flights || [];
  const first = legs[0] || {};
  const last  = legs[legs.length - 1] || {};

  const from      = first.departure_airport?.id || params?.departure_id || '';
  const to        = last.arrival_airport?.id    || params?.arrival_id   || '';
  const date      = params?.outbound_date || '';
  const ret       = params?.return_date   || '';
  const adults    = params?.adults || 1;
  const cabin     = params?.travel_class || '';
  const roundTrip = !!ret;

  const rawNum  = first.flight_number || '';
  const code    = rawNum.replace(/[\s\d].*/, '').toUpperCase();
  const flightNo = rawNum.replace(/\s/g, '');

  switch (code) {
    case 'DL': {
      const type = roundTrip ? 'ROUND_TRIP' : 'ONE_WAY';
      let url = `https://www.delta.com/us/en/booking/book-a-flight/results?tripType=${type}&departure=${from}&arrival=${to}&departDate=${date}&adults=${adults}`;
      if (DELTA_CABIN[cabin]) url += `&cabinType=${DELTA_CABIN[cabin]}`;
      if (roundTrip) url += `&returnDate=${ret}`;
      return url;
    }
    case 'AA': {
      const type = roundTrip ? 'RoundTrip' : 'OneWay';
      let url = `https://www.aa.com/booking/find-flights?type=${type}&searchType=Revenue&numPax=${adults}&paxType=ADT&outbDate=${date}&origCity=${from}&destCity=${to}`;
      if (AA_CABIN[cabin]) url += `&cabin=${AA_CABIN[cabin]}`;
      if (roundTrip) url += `&inbDate=${ret}`;
      return url;
    }
    case 'UA': {
      const tt = roundTrip ? 2 : 1;
      let url = `https://www.united.com/ual/en/us/flight-search/book-a-flight/results/rev?f=${from}&t=${to}&d=${date}&tt=${tt}&px=${adults}&taxng=1&newHP=True&idx=1`;
      if (UA_CABIN[cabin]) url += `&sc=${UA_CABIN[cabin]}`;
      if (roundTrip) url += `&r=${ret}`;
      return url;
    }
    case 'WN':
      return `https://www.southwest.com/air/booking/select.html?originationAirportCode=${from}&destinationAirportCode=${to}&departureDate=${date}&departureTimeOfDay=ALL_DAY&tripType=${roundTrip ? 'roundtrip' : 'oneway'}&adult=${adults}&senior=0&fareType=USD&passengerType=ADULT${roundTrip ? `&returnDate=${ret}` : ''}`;
    case 'B6':
      return `https://www.jetblue.com/booking/flights?from=${from}&to=${to}&depart=${date}&isMultiCity=false&noOfRoute=1&adults=${adults}&children=0&infants=0&sharedMarket=false&roundTripFaresFlag=${roundTrip}`;
    case 'AS':
      return `https://www.alaskaair.com/booking/flights/search?type=${roundTrip ? 'roundtrip' : 'oneway'}&from=${from}&to=${to}&date=${date}&adult=${adults}`;
    case 'NK':
      return `https://www.spirit.com/book?origin=${from}&destination=${to}&date=${date}&passengerCount=${adults}`;
    case 'F9':
      return `https://booking.flyfrontier.com/flight/search?type=${roundTrip ? 'RT' : 'OW'}&origin=${from}&destination=${to}&departDate=${date}&adult=${adults}`;
    case 'BA':
      return `https://www.britishairways.com/travel/booking/public/en_us?eId=106002&dt=${date}&oad=${from}&dad=${to}&pax=${adults}`;
    case 'LH':
      return `https://www.lufthansa.com/us/en/flight-search?departure=${from}&arrival=${to}&outwardDate=${date}&adults=${adults}`;
    case 'EK':
      return `https://www.emirates.com/us/english/booking/search/?departureId=${from}&arrivalId=${to}&departDate=${date}&adults=${adults}&type=${roundTrip ? 'roundTrip' : 'oneWay'}`;
    case 'QR':
      return `https://www.qatarairways.com/en-us/offers/booking?ADT=${adults}&dep=${from}&des=${to}&dom=b&flexi=off&jt=${roundTrip ? 'R' : 'O'}&lang=en&outward=${date}&type=A${roundTrip ? `&inward=${ret}` : ''}`;
    case 'AF':
      return `https://www.airfrance.us/US/en/common/home/flights/booking-flight-airfrance.do?origin=${from}&destination=${to}&passengers.ADT=${adults}&segment.origin[0]=${from}&segment.destination[0]=${to}&segment.departureDate[0]=${date}`;
    default:
      // Fallback: Kayak filtered by flight number so the exact flight is visible
      return `https://www.kayak.com/flights/${from}-${to}/${date}${flightNo ? `?fs=flightno=${flightNo}` : ''}`;
  }
}

export default function FlightCard({ flight, isBest, params }) {
  const [expanded, setExpanded] = useState(false);

  const handleBook = () => {
    window.open(buildAirlineUrl(flight, params), '_blank', 'noopener,noreferrer');
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
