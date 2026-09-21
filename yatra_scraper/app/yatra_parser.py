from pathlib import Path
from datetime import datetime
import re
import hashlib

import pandas as pd
from bs4 import BeautifulSoup


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

PROCESSED_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# SEARCH CONFIGURATION
# ============================================================

SOURCE = "Yatra"

ORIGIN = "DEL"
DESTINATION = "BOM"

TRAVEL_DATE = "2026-09-18"

CABIN = "Economy"

ADULTS = 1

ROUTE = f"{ORIGIN}-{DESTINATION}"


# ============================================================
# FIND LATEST HTML FILE
# ============================================================

def get_latest_html():

    files = list(
        RAW_DIR.glob(
            "yatra_results_*.html"
        )
    )

    if not files:

        raise FileNotFoundError(
            "No Yatra result HTML file found."
        )

    latest = max(
        files,
        key=lambda file: file.stat().st_mtime
    )

    return latest


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(value):

    if value is None:
        return None

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    value = value.strip()

    return value if value else None


# ============================================================
# PRICE NORMALIZATION
# ============================================================

def parse_price(value):

    if not value:
        return None

    # Example:
    # ₹6,530
    # Rs. 6,530
    # 6,530

    cleaned = re.sub(
        r"[^\d.]",
        "",
        value
    )

    if not cleaned:
        return None

    try:

        return float(cleaned)

    except ValueError:

        return None


# ============================================================
# DURATION NORMALIZATION
# ============================================================

def duration_to_minutes(value):

    if not value:
        return None

    value = value.lower()

    hours = 0
    minutes = 0

    hour_match = re.search(
        r"(\d+)\s*h",
        value
    )

    minute_match = re.search(
        r"(\d+)\s*m",
        value
    )

    if hour_match:

        hours = int(
            hour_match.group(1)
        )

    if minute_match:

        minutes = int(
            minute_match.group(1)
        )

    if not hour_match and not minute_match:

        return None

    return (
        hours * 60
        + minutes
    )


# ============================================================
# STOPS NORMALIZATION
# ============================================================

def normalize_stops(value):

    if not value:
        return None

    value = value.lower().strip()

    if (
        "non stop" in value
        or "non-stop" in value
    ):

        return 0

    match = re.search(
        r"(\d+)\s*stop",
        value
    )

    if match:

        return int(
            match.group(1)
        )

    return None


# ============================================================
# FINGERPRINT
# ============================================================

def create_fingerprint(
    airline,
    flight_number,
    departure_time,
    arrival_time,
    origin,
    destination,
    travel_date
):

    raw = "|".join([
        airline or "",
        flight_number or "",
        departure_time or "",
        arrival_time or "",
        origin,
        destination,
        travel_date
    ])

    return hashlib.sha256(
        raw.encode("utf-8")
    ).hexdigest()


# ============================================================
# PARSE HTML
# ============================================================

def parse_yatra_html(
    html,
    source_url
):

    soup = BeautifulSoup(
        html,
        "html.parser"
    )

    cards = soup.select(
        "div.flightItem"
    )

    print(
        f"Flight cards detected: {len(cards)}"
    )

    records = []

    fingerprints = set()

    scraped_at = datetime.now().isoformat(
        timespec="seconds"
    )

    # ========================================================
    # LOOP THROUGH FLIGHT CARDS
    # ========================================================

    for index, card in enumerate(
        cards,
        start=1
    ):

        print(
            f"\nProcessing card {index}..."
        )

        # ----------------------------------------------------
        # AIRLINE
        # ----------------------------------------------------

        airline_element = card.select_one(
            ".airline-name span[title]"
        )

        airline = None

        if airline_element:

            airline = (
                airline_element.get("title")
                or airline_element.get_text(
                    strip=True
                )
            )

        airline = clean_text(
            airline
        )

        # ----------------------------------------------------
        # FLIGHT NUMBER
        # ----------------------------------------------------

        flight_number_element = card.select_one(
            ".fl-no span"
        )

        flight_number = (
            flight_number_element.get_text(
                strip=True
            )
            if flight_number_element
            else None
        )

        flight_number = clean_text(
            flight_number
        )

        # ----------------------------------------------------
        # DEPARTURE TIME
        # ----------------------------------------------------

        departure_element = card.select_one(
            '[autom="departureTimeLabel"]'
        )

        departure_time = (
            departure_element.get_text(
                " ",
                strip=True
            )
            if departure_element
            else None
        )

        departure_time = clean_text(
            departure_time
        )

        # ----------------------------------------------------
        # ARRIVAL TIME
        # ----------------------------------------------------

        arrival_element = card.select_one(
            '[autom="arrivalTimeLabel"]'
        )

        arrival_time = (
            arrival_element.get_text(
                " ",
                strip=True
            )
            if arrival_element
            else None
        )

        arrival_time = clean_text(
            arrival_time
        )

        # ----------------------------------------------------
        # DEPARTURE CITY
        # ----------------------------------------------------

        departure_city_element = card.select_one(
            ".dtime .city"
        )

        departure_city = None

        if departure_city_element:

            departure_city = (
                departure_city_element.get("title")
                or departure_city_element.get_text(
                    strip=True
                )
            )

        departure_city = clean_text(
            departure_city
        )

        # ----------------------------------------------------
        # ARRIVAL CITY
        # ----------------------------------------------------

        arrival_city_element = card.select_one(
            ".atime .city"
        )

        arrival_city = None

        if arrival_city_element:

            arrival_city = (
                arrival_city_element.get("title")
                or arrival_city_element.get_text(
                    strip=True
                )
            )

        arrival_city = clean_text(
            arrival_city
        )

        # ----------------------------------------------------
        # DURATION
        # ----------------------------------------------------

        duration_element = card.select_one(
            '[autom="durationLabel"]'
        )

        duration_text = (
            duration_element.get_text(
                " ",
                strip=True
            )
            if duration_element
            else None
        )

        duration_text = clean_text(
            duration_text
        )

        duration_minutes = duration_to_minutes(
            duration_text
        )

        # ----------------------------------------------------
        # STOPS
        # ----------------------------------------------------

        stop_element = card.select_one(
            ".stop-det span"
        )

        stops_text = (
            stop_element.get_text(
                " ",
                strip=True
            )
            if stop_element
            else None
        )

        stops_text = clean_text(
            stops_text
        )

        stops = normalize_stops(
            stops_text
        )

        # ----------------------------------------------------
        # PRICE
        # ----------------------------------------------------

        price_element = card.select_one(
            '[autom="priceLabel"]'
        )

        price_text = (
            price_element.get_text(
                " ",
                strip=True
            )
            if price_element
            else None
        )

        price_text = clean_text(
            price_text
        )

        price_inr = parse_price(
            price_text
        )

        # ----------------------------------------------------
        # FINGERPRINT
        # ----------------------------------------------------

        fingerprint = create_fingerprint(

            airline=airline,

            flight_number=flight_number,

            departure_time=departure_time,

            arrival_time=arrival_time,

            origin=ORIGIN,

            destination=DESTINATION,

            travel_date=TRAVEL_DATE
        )

        # ----------------------------------------------------
        # DUPLICATE CHECK
        # ----------------------------------------------------

        if fingerprint in fingerprints:

            print(
                "Duplicate flight skipped."
            )

            continue

        fingerprints.add(
            fingerprint
        )

        # ----------------------------------------------------
        # RECORD
        # ----------------------------------------------------

        record = {

            "source": SOURCE,

            "scraped_at": scraped_at,

            "travel_date": TRAVEL_DATE,

            "origin": ORIGIN,

            "destination": DESTINATION,

            "airline": airline,

            "flight_number": flight_number,

            "departure_time": departure_time,

            "arrival_time": arrival_time,

            "departure_city": departure_city,

            "arrival_city": arrival_city,

            "duration_minutes": duration_minutes,

            "stops": stops,

            "cabin": CABIN,

            "price_inr": price_inr,

            "currency": "INR",

            "route": ROUTE,

            "source_url": source_url,

        }

        # ----------------------------------------------------
        # OBSERVATION ID
        # ----------------------------------------------------

        observation_string = (
            f"{fingerprint}|"
            f"{scraped_at}|"
            f"{price_inr}"
        )

        observation_id = hashlib.sha256(
            observation_string.encode(
                "utf-8"
            )
        ).hexdigest()

        record[
            "observation_id"
        ] = observation_id

        record[
            "flight_fingerprint"
        ] = fingerprint

        records.append(
            record
        )

        # ----------------------------------------------------
        # DISPLAY
        # ----------------------------------------------------

        print(
            f"{airline} | "
            f"{flight_number} | "
            f"{departure_time} → "
            f"{arrival_time} | "
            f"{duration_minutes} min | "
            f"{stops} stop(s) | "
            f"₹{price_inr}"
        )

    return records


# ============================================================
# VALIDATION
# ============================================================

def validate_dataframe(df):

    print("\n")
    print("=" * 70)
    print("VALIDATION")
    print("=" * 70)

    required_columns = [

        "source",
        "scraped_at",
        "travel_date",
        "origin",
        "destination",
        "airline",
        "flight_number",
        "departure_time",
        "arrival_time",
        "duration_minutes",
        "stops",
        "cabin",
        "price_inr",
        "currency",
        "route",
        "source_url",
        "observation_id",
        "flight_fingerprint"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:

        print(
            "Missing columns:",
            missing_columns
        )

    else:

        print(
            "All required columns present."
        )

    # --------------------------------------------------------
    # Price validation
    # --------------------------------------------------------

    invalid_price = df[
        (df["price_inr"].isna())
        |
        (df["price_inr"] <= 0)
    ]

    print(
        "Invalid prices:",
        len(invalid_price)
    )

    # --------------------------------------------------------
    # Duration validation
    # --------------------------------------------------------

    invalid_duration = df[
        (df["duration_minutes"].isna())
        |
        (df["duration_minutes"] <= 0)
    ]

    print(
        "Invalid durations:",
        len(invalid_duration)
    )

    # --------------------------------------------------------
    # Airline validation
    # --------------------------------------------------------

    missing_airline = df[
        df["airline"].isna()
    ]

    print(
        "Missing airlines:",
        len(missing_airline)
    )

    # --------------------------------------------------------
    # Flight number validation
    # --------------------------------------------------------

    missing_flight_number = df[
        df["flight_number"].isna()
    ]

    print(
        "Missing flight numbers:",
        len(missing_flight_number)
    )

    # --------------------------------------------------------
    # Duplicate fingerprints
    # --------------------------------------------------------

    duplicate_count = (
        df["flight_fingerprint"]
        .duplicated()
        .sum()
    )

    print(
        "Duplicate fingerprints:",
        duplicate_count
    )


# ============================================================
# SAVE CSV
# ============================================================

def save_csv(df):

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )

    output_path = (
        PROCESSED_DIR /
        f"yatra_del_bom_{timestamp}.csv"
    )

    df.to_csv(
        output_path,
        index=False,
        encoding="utf-8"
    )

    print("\n")
    print(
        "=" * 70
    )

    print(
        "CSV SAVED"
    )

    print(
        "=" * 70
    )

    print(
        output_path
    )

    return output_path


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "SIH26056 - YATRA HTML PARSER"
    )

    print("=" * 70)

    # --------------------------------------------------------
    # Find HTML
    # --------------------------------------------------------

    html_file = get_latest_html()

    print(
        "\nUsing HTML:"
    )

    print(
        html_file
    )

    # --------------------------------------------------------
    # Read HTML
    # --------------------------------------------------------

    html = html_file.read_text(
        encoding="utf-8"
    )

    # --------------------------------------------------------
    # Parse
    # --------------------------------------------------------

    records = parse_yatra_html(

        html=html,

        source_url=(
            "https://flight.yatra.com/"
            "air-search-ui/dom2/trigger"
        )
    )

    # --------------------------------------------------------
    # DataFrame
    # --------------------------------------------------------

    df = pd.DataFrame(
        records
    )

    print("\n")
    print(
        "=" * 70
    )

    print(
        "EXTRACTION SUMMARY"
    )

    print(
        "=" * 70
    )

    print(
        "Total valid records:",
        len(df)
    )

    if df.empty:

        print(
            "No records extracted."
        )

        return

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    validate_dataframe(
        df
    )

    # --------------------------------------------------------
    # Preview
    # --------------------------------------------------------

    print("\n")
    print(
        "=" * 70
    )

    print(
        "DATA PREVIEW"
    )

    print(
        "=" * 70
    )

    print(
        df[
            [
                "airline",
                "flight_number",
                "departure_city",
                "arrival_city",
                "departure_time",
                "arrival_time",
                "duration_minutes",
                "stops",
                "price_inr"
            ]
        ].to_string(
            index=False
        )
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    save_csv(
        df
    )


if __name__ == "__main__":

    main()