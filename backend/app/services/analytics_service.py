from datetime import datetime, timedelta
from typing import List, Dict, Any
from ..models.schemas import (
    FareTrendPoint,
    PriceInsight,
    FeatureImportance,
    PopularFlight,
    BestTimeToBook
)

class AnalyticsService:
    """
    Computes analytical derivatives for frontend dashboard:
    - 30-day dynamic fare trend
    - Best time to book recommendations
    - Behavioral price insights
    - Feature importance breakdown
    - Route airline comparisons
    """
    def generate_fare_trend(self, base_fare: float, departure_date_str: str) -> List[FareTrendPoint]:
        try:
            dep_date = datetime.strptime(departure_date_str, "%Y-%m-%d").date()
        except Exception:
            dep_date = datetime.now().date() + timedelta(days=14)

        # Generate 14-30 points centered around the requested window
        trend_points: List[FareTrendPoint] = []
        min_fare = float("inf")
        min_idx = 0

        # Offsets from -3 days to +26 days (30 days total)
        for i in range(-3, 27):
            curr_date = dep_date + timedelta(days=i)
            # Weekday factor
            dow = curr_date.weekday()
            dow_mult = 1.15 if dow in [4, 6] else (0.92 if dow in [1, 2] else 1.0)
            
            # Sine wave variation simulating natural market volatility
            import math
            wave = math.sin(i * 0.45) * 0.08
            pt_fare = round((base_fare * dow_mult * (1.0 + wave)) / 10) * 10
            
            if pt_fare < min_fare:
                min_fare = pt_fare
                min_idx = len(trend_points)

            trend_points.append(FareTrendPoint(
                date=curr_date.strftime("%b %d"),
                predicted_fare=float(pt_fare),
                is_optimal=False
            ))

        if trend_points:
            trend_points[min_idx].is_optimal = True

        return trend_points

    def calculate_best_time(self, base_fare: float, trend: List[FareTrendPoint]) -> BestTimeToBook:
        optimal_pt = next((p for p in trend if p.is_optimal), trend[0] if trend else None)
        if optimal_pt:
            diff = max(0.0, base_fare - optimal_pt.predicted_fare)
            return BestTimeToBook(
                recommended_date=optimal_pt.date,
                predicted_lowest_fare=optimal_pt.predicted_fare,
                potential_difference=diff,
                advice=f"Booking for travel on {optimal_pt.date} could save up to ₹{int(diff):,} compared to peak weekend fares.",
                confidence_score=88
            )
        return BestTimeToBook(
            recommended_date="14 days prior",
            predicted_lowest_fare=round(base_fare * 0.9),
            potential_difference=round(base_fare * 0.1),
            advice="Fares historically trend lowest when secured 14 to 21 days in advance.",
            confidence_score=85
        )

    def generate_price_insights(self, price_status: str, days_ahead: int) -> List[PriceInsight]:
        insights = []
        
        if days_ahead < 7:
            insights.append(PriceInsight(
                title="Last-Minute Booking Curve",
                description="Ticket prices are near historical corridor peak. Consider shifting by 2-3 days for lower inventory rates.",
                type="warning",
                impact="+18% Price Surge"
            ))
        elif 14 <= days_ahead <= 28:
            insights.append(PriceInsight(
                title="Golden Booking Window",
                description="Current advance purchase timing is optimal. Seat capacity on this corridor is at high availability.",
                type="positive",
                impact="-12% Savings"
            ))
        else:
            insights.append(PriceInsight(
                title="Early Fare Stability",
                description="Fares on this route are expected to remain steady over the next 10 days.",
                type="info",
                impact="Neutral"
            ))

        insights.append(PriceInsight(
            title="Mid-Week Price Advantage",
            description="Departures on Tuesday and Wednesday demonstrate 14% lower median fares on this route.",
            type="positive",
            impact="Recommended"
        ))

        insights.append(PriceInsight(
            title="Corridor Capacity Index",
            description="Metro corridor routes maintain 99.2% historical flight operation regularity.",
            type="info",
            impact="High Frequency"
        ))

        return insights

    def get_feature_importance(self) -> List[FeatureImportance]:
        return [
            FeatureImportance(feature="Airline Carrier", importance=0.28, description="Brand tier, service model & load factor"),
            FeatureImportance(feature="Advance Timing", importance=0.24, description="Days between search date and departure"),
            FeatureImportance(feature="Route & Distance", importance=0.18, description="Corridor competition and nautical mileage"),
            FeatureImportance(feature="Stops & Layover", importance=0.14, description="Direct speed versus connecting penalty"),
            FeatureImportance(feature="Day of Week", importance=0.10, description="Weekend leisure versus weekday corporate demand"),
            FeatureImportance(feature="Seasonality", importance=0.06, description="Festival peak and holiday travel periods"),
        ]

    def get_popular_flights(self, origin: str, dest: str, base_fare: float) -> List[PopularFlight]:
        return [
            PopularFlight(
                airline="IndiGo",
                flight_number="6E-2134",
                departure_time="06:15",
                arrival_time="08:25",
                duration="2h 10m",
                stops="Non-stop",
                predicted_fare=round(base_fare * 0.94),
                currency="INR"
            ),
            PopularFlight(
                airline="Air India",
                flight_number="AI-806",
                departure_time="09:40",
                arrival_time="11:55",
                duration="2h 15m",
                stops="Non-stop",
                predicted_fare=round(base_fare * 1.05),
                currency="INR"
            ),
            PopularFlight(
                airline="Vistara",
                flight_number="UK-994",
                departure_time="14:20",
                arrival_time="16:30",
                duration="2h 10m",
                stops="Non-stop",
                predicted_fare=round(base_fare * 1.08),
                currency="INR"
            ),
            PopularFlight(
                airline="Akasa Air",
                flight_number="QP-1102",
                departure_time="19:50",
                arrival_time="22:05",
                duration="2h 15m",
                stops="Non-stop",
                predicted_fare=round(base_fare * 0.92),
                currency="INR"
            ),
        ]

analytics_service = AnalyticsService()
