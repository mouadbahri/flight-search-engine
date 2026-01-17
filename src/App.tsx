import { useEffect } from "react";
import { searchFlights } from "./services/amadeus";

function App() {
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await searchFlights("JFK", "LAX", "2026-02-01");
        console.log("Flights:", data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFlights();
  }, []);

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <h1 className="text-3xl font-bold text-green-900">
        Flight API Test — Check Console
      </h1>
    </div>
  );
}

export default App;