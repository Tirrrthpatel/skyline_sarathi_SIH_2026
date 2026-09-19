/**
 * Skyline सारथी API Service
 * Strictly handles API communication between the React frontend and FastAPI backend.
 * The frontend NEVER performs ML prediction calculations or model inference.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function predictFare(searchParams) {
  try {
    const response = await fetch(`${API_BASE_URL}/predict-fare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: searchParams.origin || 'DEL',
        destination: searchParams.destination || 'BOM',
        departure_date: searchParams.departure_date || '2026-10-20',
        trip_type: searchParams.trip_type || 'one_way',
        travellers: Number(searchParams.travellers) || 1,
        cabin_class: searchParams.cabin_class || 'economy',
        preferred_airline: searchParams.preferred_airline || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[Skyline सारथी API] Backend service unavailable or network error. Using structured offline fallback.', error);
    // Structured fallback maintaining exact schema if backend is unreachable
    return {
      origin: searchParams.origin || 'DEL',
      destination: searchParams.destination || 'BOM',
      departure_date: searchParams.departure_date || '2026-10-20',
      predicted_fare: 5440,
      currency: 'INR',
      expected_min: 4890,
      expected_max: 6090,
      confidence: 87,
      price_status: 'average',
      is_demo: true,
      model_status: 'Backend Connection Offline (Ensure FastAPI server is running on port 8000)',
      best_time_to_book: {
        recommended_date: '14 days prior',
        predicted_lowest_fare: 4800,
        potential_difference: 640,
        advice: 'Fares on this corridor historically soften 14 to 21 days before departure.',
        confidence_score: 85
      },
      fare_trend: [
        { date: 'Oct 17', predicted_fare: 5800, is_optimal: false },
        { date: 'Oct 18', predicted_fare: 5500, is_optimal: false },
        { date: 'Oct 19', predicted_fare: 5100, is_optimal: false },
        { date: 'Oct 20', predicted_fare: 4850, is_optimal: true },
        { date: 'Oct 21', predicted_fare: 5300, is_optimal: false },
        { date: 'Oct 22', predicted_fare: 5650, is_optimal: false },
        { date: 'Oct 23', predicted_fare: 5900, is_optimal: false },
      ],
      price_insights: [
        {
          title: 'Golden Booking Window',
          description: 'Current advance timing matches optimal corridor availability.',
          type: 'positive',
          impact: '-12% Savings'
        },
        {
          title: 'Mid-Week Price Advantage',
          description: 'Departures on Tuesday and Wednesday show lower median fares.',
          type: 'positive',
          impact: 'Recommended'
        }
      ],
      feature_importance: [
        { feature: 'Airline Carrier', importance: 0.28, description: 'Brand tier & load factor' },
        { feature: 'Advance Timing', importance: 0.24, description: 'Days before flight' },
        { feature: 'Route & Distance', importance: 0.18, description: 'Corridor mileage' },
        { feature: 'Stops & Layover', importance: 0.14, description: 'Direct speed' },
      ],
      popular_flights: [
        { airline: 'IndiGo', flight_number: '6E-2134', departure_time: '06:15', arrival_time: '08:25', duration: '2h 10m', stops: 'Non-stop', predicted_fare: 5110, currency: 'INR' },
        { airline: 'Air India', flight_number: 'AI-806', departure_time: '09:40', arrival_time: '11:55', duration: '2h 15m', stops: 'Non-stop', predicted_fare: 5710, currency: 'INR' },
        { airline: 'Vistara', flight_number: 'UK-994', departure_time: '14:20', arrival_time: '16:30', duration: '2h 10m', stops: 'Non-stop', predicted_fare: 5870, currency: 'INR' },
        { airline: 'Akasa Air', flight_number: 'QP-1102', departure_time: '19:50', arrival_time: '22:05', duration: '2h 15m', stops: 'Non-stop', predicted_fare: 5000, currency: 'INR' },
      ]
    };
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch {
    return { status: 'offline' };
  }
}

export async function analyzeDataset() {
  try {
    const res = await fetch(`${API_BASE_URL}/dataset/analyze`);
    return await res.json();
  } catch {
    return { is_loaded: false, message: 'Backend unreachable' };
  }
}
