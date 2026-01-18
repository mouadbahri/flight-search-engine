import { useState } from "react";
import { searchFlights } from "../services/amadeus";

interface Flight {
  id: string;
  price: number;
  carrier: string;
  departure: string;
  arrival: string;
}

export default function FlightSearch() {
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("LAX");
  const [departureDate, setDepartureDate] = useState("2026-02-01");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchFlights(origin, destination, departureDate);
      // Map API results to simplified Flight type
      const mappedFlights = data.data.map((f: any) => ({
        id: f.id,
        price: f?.price?.total || 0,
        carrier: f?.validatingAirlineCodes?.[0] || "N/A",
        departure: f?.itineraries?.[0]?.segments?.[0]?.departure?.at || "N/A",
        arrival: f?.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.at || "N/A",
      }));
      setFlights(mappedFlights);
    } catch (err) {
      console.error(err);
      alert("Error fetching flights");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Flight Search</h2>

      <div className="grid gap-4 mb-4">
        <input
          type="text"
          placeholder="Origin (e.g., JFK)"
          className="border p-2 rounded"
          value={origin}
          onChange={(e) => setOrigin(e.target.value.toUpperCase())}
        />
        <input
          type="text"
          placeholder="Destination (e.g., LAX)"
          className="border p-2 rounded"
          value={destination}
          onChange={(e) => setDestination(e.target.value.toUpperCase())}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search Flights"}
        </button>
      </div>

      <div>
        {flights.length > 0 && (
          <ul className="space-y-2">
            {flights.map((f) => (
              <li key={f.id} className="p-2 border rounded">
                <div>
                  <strong>{f.carrier}</strong> — ${f.price}
                </div>
                <div>
                  Departure: {f.departure} | Arrival: {f.arrival}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}