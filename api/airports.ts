export const config = {
  runtime: 'nodejs',
};

const AIRPORTS = [
  { code: "DEL", city: "New Delhi", airport: "Indira Gandhi International Airport", lat: 28.5562, lng: 77.1000, terminal: "T3", state: "Delhi NCR" },
  { code: "BOM", city: "Mumbai", airport: "Chhatrapati Shivaji Maharaj International Airport", lat: 19.0896, lng: 72.8656, terminal: "T2", state: "Maharashtra" },
  { code: "BLR", city: "Bengaluru", airport: "Kempegowda International Airport", lat: 13.1986, lng: 77.7066, terminal: "T2", state: "Karnataka" },
  { code: "MAA", city: "Chennai", airport: "Chennai International Airport", lat: 12.9941, lng: 80.1709, terminal: "T1", state: "Tamil Nadu" },
  { code: "CCU", city: "Kolkata", airport: "Netaji Subhash Chandra Bose International Airport", lat: 22.6547, lng: 88.4467, terminal: "T2", state: "West Bengal" },
  { code: "HYD", city: "Hyderabad", airport: "Rajiv Gandhi International Airport", lat: 17.2403, lng: 78.4294, terminal: "T1", state: "Telangana" },
];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json(AIRPORTS);
}
