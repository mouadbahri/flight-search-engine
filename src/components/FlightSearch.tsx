import { useState } from "react";
import { searchFlights } from "../services/amadeus";
import type { Flight } from "../types/flight";
import { useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function FlightSearch() {
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("LAX");
  const [departureDate, setDepartureDate] = useState("2026-02-01");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [maxStops, setMaxStops] = useState<number>(2);
  const [airline, setAirline] = useState<string>("ALL");

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchFlights(origin, destination, departureDate);
      // Map API results to simplified Flight type
      const mappedFlights: Flight[] = data.data.map((f: any) => {
        const segments = f.itineraries[0].segments;

        return {
            id: f.id,
            price: Number(f.price.total),
            airline: f.validatingAirlineCodes?.[0] ?? "N/A",
            stops: segments.length - 1,
            departure: segments[0].departure.at,
            arrival: segments[segments.length - 1].arrival.at,
        };
        });
      setFlights(mappedFlights);
      setFilteredFlights(mappedFlights);
    } catch (err) {
      console.error(err);
      alert("Error fetching flights");
    }
    setLoading(false);
  };

  const priceChartData = filteredFlights.map((flight, index) => ({
    index: index + 1,
    price: flight.price,
  }));

  useEffect(() => {
    let result = flights;

    result = result.filter(f => f.price <= maxPrice);
    result = result.filter(f => f.stops <= maxStops);

    if (airline !== "ALL") {
        result = result.filter(f => f.airline === airline);
    }

    setFilteredFlights(result);
  }, [maxPrice, maxStops, airline, flights]);

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

      <div className="mb-6 p-4 border rounded bg-gray-50 space-y-4">
        <h3 className="font-semibold">Filters</h3>

        {/* Max Price */}
        <div>
            <label className="block text-sm mb-1">
            Max Price: ${maxPrice}
            </label>
            <input
            type="range"
            min={100}
            max={5000}
            step={50}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
            />
        </div>

        {/* Max Stops */}
        <div>
            <label className="block text-sm mb-1">
            Max Stops: {maxStops}
            </label>
            <input
            type="number"
            min={0}
            max={3}
            value={maxStops}
            onChange={(e) => setMaxStops(Number(e.target.value))}
            className="border p-1 rounded w-20"
            />
        </div>

        {/* Airline */}
        <div>
            <label className="block text-sm mb-1">Airline</label>
            <select
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            className="border p-2 rounded w-full"
            >
            <option value="ALL">All Airlines</option>
            {[...new Set(flights.map(f => f.airline))].map(code => (
                <option key={code} value={code}>
                {code}
                </option>
            ))}
            </select>
        </div>
      </div>


      <div className="mb-8">
        <h3 className="font-semibold mb-2">Price Trend</h3>

        {priceChartData.length > 0 ? (
            <div className="w-full h-64 bg-white border rounded p-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceChartData}>
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="price"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                />
                </LineChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <p className="text-sm text-gray-500">No data to display</p>
        )}
      </div>

      <div>
        {flights.length > 0 && (
          <ul className="space-y-2">
            {filteredFlights.map((f) => (
              <li key={f.id} className="p-2 border rounded">
                <div>
                  <strong>{f.airline}</strong> — ${f.price}
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