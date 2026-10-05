from functools import lru_cache
from itertools import product
from datetime import date
from typing import TypedDict

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import GroupShuffleSplit, train_test_split

FEATURE_NAMES = ("distance_km", "booking_window_days", "stops")


class FareObservation(TypedDict):
    departure_date: date
    scrape_date: date
    median_fare: float


@lru_cache(maxsize=1)
def _train_demo_model() -> tuple[LinearRegression, dict[str, float | int]]:
    distances = (350, 700, 1050, 1400, 1750)
    booking_windows = (7, 14, 30, 60)
    stop_counts = (0, 1, 2)

    features: list[list[float]] = []
    fares: list[float] = []
    for distance_index, booking_index, stops in product(
        range(len(distances)), range(len(booking_windows)), stop_counts
    ):
        distance = distances[distance_index]
        booking_days = booking_windows[booking_index]
        noise = ((distance_index * 17 + booking_index * 23 + stops * 31) % 81) - 40
        features.append([distance, booking_days, stops])
        fares.append(1400 + 4.2 * distance + 15 * booking_days + 725 * stops + noise)

    x_train, x_test, y_train, y_test = train_test_split(
        features, fares, test_size=0.2, random_state=42
    )
    model = LinearRegression()
    model.fit(x_train, y_train)
    test_predictions = model.predict(x_test)

    evaluation: dict[str, float | int] = {
        "trainingSamples": len(x_train),
        "testSamples": len(x_test),
        "testMae": round(float(mean_absolute_error(y_test, test_predictions)), 2),
        "testR2": round(float(r2_score(y_test, test_predictions)), 4),
    }
    return model, evaluation


def predict_demo_fare(
    distance_km: float, booking_window_days: int, stops: int
) -> dict[str, object]:
    model, evaluation = _train_demo_model()
    predicted_fare = float(
        model.predict([[distance_km, booking_window_days, stops]])[0]
    )

    return {
        "model": "LinearRegression",
        "demoOnly": True,
        "trainingData": "synthetic",
        "features": {
            "distanceKm": distance_km,
            "bookingWindowDays": booking_window_days,
            "stops": stops,
        },
        "predictedFare": max(0, round(predicted_fare)),
        "currency": "INR",
        "evaluation": evaluation,
        "coefficients": {
            name: round(float(coefficient), 4)
            for name, coefficient in zip(FEATURE_NAMES, model.coef_)
        },
        "intercept": round(float(model.intercept_), 2),
    }


def predict_route_fare(
    observations: list[FareObservation], departure_date: date, today: date
) -> dict[str, float | int] | None:
    usable_observations = [
        observation
        for observation in observations
        if 0 <= (observation["departure_date"] - observation["scrape_date"]).days <= 90
    ]
    departure_dates = {item["departure_date"] for item in usable_observations}
    if len(usable_observations) < 8 or len(departure_dates) < 5:
        return None

    features = [
        [
            (item["departure_date"] - item["scrape_date"]).days,
            item["departure_date"].weekday(),
            item["departure_date"].month,
            int(item["departure_date"].weekday() >= 5),
        ]
        for item in usable_observations
    ]
    fares = [float(item["median_fare"]) for item in usable_observations]
    groups = [item["departure_date"] for item in usable_observations]

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
    train_indices, test_indices = next(splitter.split(features, fares, groups))
    test_model = LinearRegression().fit(
        [features[index] for index in train_indices],
        [fares[index] for index in train_indices],
    )
    test_predictions = test_model.predict(
        [features[index] for index in test_indices]
    )

    model = LinearRegression().fit(features, fares)
    booking_days = max(0, (departure_date - today).days)
    predicted_fare = float(
        model.predict(
            [[
                booking_days,
                departure_date.weekday(),
                departure_date.month,
                int(departure_date.weekday() >= 5),
            ]]
        )[0]
    )

    return {
        "predictedFare": max(0, round(predicted_fare)),
        "trainingSamples": len(features),
        "testSamples": len(test_indices),
        "testMae": round(float(mean_absolute_error(
            [fares[index] for index in test_indices], test_predictions
        )), 2),
        "testR2": round(float(r2_score(
            [fares[index] for index in test_indices], test_predictions
        )), 4),
    }
