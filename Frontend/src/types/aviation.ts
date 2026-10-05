export interface Airport {
  code: string;        // "DEL", "BOM", "BLR", "MAA", "CCU", "HYD", "GOI", etc.
  city: string;
  airport: string;      // full name
  lat: number;
  lng: number;
  terminal?: string;
  state?: string;
}

export interface FlightSearchParams {
  origin: string;             // default 'DEL'
  destination: string;        // default 'BLR'
  departure_date: string;      // ISO date
  return_date?: string;
  trip_type: 'one_way' | 'round_trip';
  travellers: number;          // default 1
  cabin_class: 'Economy' | 'Premium Economy' | 'Business';
}

export interface FareCalculationDetails {
  predictedFare: number;
  confidence: number | null;   // unavailable when no calibrated model is configured
  variance: number;            // %
  bookingWindowDays: number;
  historicalAvg: number;
  corridorStatus?: 'Below Avg Fare' | 'Optimal Window' | 'Surge Alert';
  distanceKm: number;
  flightDurationMinutes: number | null;
  volatilityScore?: number;
  sampleSize?: number;
  currency?: string;
  predictionSource?: "database" | "linear_regression";
  modelTrainingSamples?: number | null;
  modelTestMae?: number | null;
  modelTestR2?: number | null;
  bestBookingWindowDays?: number | null;
  recommendedPurchaseDate?: string | null;
  bookingWindowSampleSize?: number;
  bestWindowAverageFare?: number | null;
}

export interface Airline {
  code: string;
  name: string;
  multiplier: number;
  category: string;
  highlights: string;
  flightNumberPrefix: string;
  baggage: string;
  departureTime: string;
  arrivalTime: string;
  stops: string;
  departureAirport?: string;
  departureAirportCode?: string;
  arrivalAirport?: string;
  arrivalAirportCode?: string;
  departureDate?: string;
  flightDuration?: string | null;
  currentPrice?: number;
  currency?: string;
  website?: string;
  scrapeTimestamp?: string | null;
}

export interface FunnelStage {
  id: string;
  name: string;
  amount: number;
  pctOfPredicted: number;
  confidence: number;
  variance: number;
  description: string;
}

export interface ForecastPoint {
  dayOffset: number;
  dateStr: string;
  fare: number;
  isToday?: boolean;
  status: 'Historical' | 'Current' | 'Projected';
}

export interface TelemetryPredictionResult {
  params: FlightSearchParams;
  originAirport: Airport;
  destinationAirport: Airport;
  destAirport?: Airport;
  details: FareCalculationDetails;
  airlines: (Airline & { calculatedFare: number })[];
  funnelStages: FunnelStage[];
  forecastCurve: ForecastPoint[];
  bearing: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isGuest: boolean;
  loginTime: string;
}
