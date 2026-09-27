from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

INDIAN_AIRPORTS = [
    {
        "code": "DEL",
        "city": "New Delhi",
        "airport": "Indira Gandhi International Airport",
        "lat": 28.5562,
        "lng": 77.1000,
        "terminal": "T3",
        "state": "Delhi NCR"
    },
    {
        "code": "BOM",
        "city": "Mumbai",
        "airport": "Chhatrapati Shivaji Maharaj International Airport",
        "lat": 19.0896,
        "lng": 72.8656,
        "terminal": "T2",
        "state": "Maharashtra"
    },
    {
        "code": "BLR",
        "city": "Bengaluru",
        "airport": "Kempegowda International Airport",
        "lat": 13.1986,
        "lng": 77.7066,
        "terminal": "T2",
        "state": "Karnataka"
    },
    {
        "code": "MAA",
        "city": "Chennai",
        "airport": "Chennai International Airport",
        "lat": 12.9941,
        "lng": 80.1709,
        "terminal": "T1",
        "state": "Tamil Nadu"
    },
    {
        "code": "CCU",
        "city": "Kolkata",
        "airport": "Netaji Subhash Chandra Bose International Airport",
        "lat": 22.6547,
        "lng": 88.4467,
        "terminal": "T2",
        "state": "West Bengal"
    },
    {
        "code": "HYD",
        "city": "Hyderabad",
        "airport": "Rajiv Gandhi International Airport",
        "lat": 17.2403,
        "lng": 78.4294,
        "terminal": "T1",
        "state": "Telangana"
    },
    {
        "code": "GOI",
        "city": "Goa (Dabolim)",
        "airport": "Dabolim & Manohar International Airport",
        "lat": 15.3800,
        "lng": 73.8314,
        "terminal": "T1",
        "state": "Goa"
    },
    {
        "code": "AMD",
        "city": "Ahmedabad",
        "airport": "Sardar Vallabhbhai Patel International Airport",
        "lat": 23.0772,
        "lng": 72.6347,
        "terminal": "T1",
        "state": "Gujarat"
    },
    {
        "code": "PNQ",
        "city": "Pune",
        "airport": "Pune International Airport",
        "lat": 18.5822,
        "lng": 73.9197,
        "terminal": "T1",
        "state": "Maharashtra"
    },
    {
        "code": "COK",
        "city": "Kochi",
        "airport": "Cochin International Airport",
        "lat": 10.1556,
        "lng": 76.3934,
        "terminal": "T3",
        "state": "Kerala"
    },
    {
        "code": "JAI",
        "city": "Jaipur",
        "airport": "Jaipur International Airport",
        "lat": 26.8242,
        "lng": 75.8122,
        "terminal": "T2",
        "state": "Rajasthan"
    },
    {
        "code": "GAU",
        "city": "Guwahati",
        "airport": "Lokpriya Gopinath Bordoloi International Airport",
        "lat": 26.1061,
        "lng": 91.5859,
        "terminal": "T1",
        "state": "Assam"
    }
]

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "flask_scraping_feed",
        "active_corridors": len(INDIAN_AIRPORTS)
    })

@app.route("/api/airports", methods=["GET"])
def get_airports():
    return jsonify(INDIAN_AIRPORTS)

@app.route("/api/scraped-feed", methods=["GET"])
def get_scraped_feed():
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "source": "Skyline Multi-OTA Distributed Scraper",
        "routes_sampled": 128,
        "latest_fares": [
            {"corridor": "DEL-BLR", "carrier": "6E", "tariff": 4850, "status": "CONFIRMED"},
            {"corridor": "BOM-DEL", "carrier": "AI", "tariff": 5420, "status": "CONFIRMED"},
            {"corridor": "BLR-CCU", "carrier": "QP", "tariff": 4610, "status": "CONFIRMED"},
            {"corridor": "DEL-GOI", "carrier": "SG", "tariff": 5120, "status": "SURGE"}
        ]
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
