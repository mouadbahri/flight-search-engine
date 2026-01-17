import axios from "axios";

const AMADEUS_CLIENT_ID = import.meta.env.VITE_AMADEUS_API_KEY;
const AMADEUS_CLIENT_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;

let accessToken: string | null = null;

// Get Access Token
export const getAmadeusToken = async () => {
  if (accessToken) return accessToken; // reuse token

  const response = await axios.post(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: AMADEUS_CLIENT_ID,
      client_secret: AMADEUS_CLIENT_SECRET,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  accessToken = response.data.access_token;
  return accessToken;
};

// Search Flights (example)
export const searchFlights = async (
  origin: string,
  destination: string,
  departureDate: string
) => {
  const token = await getAmadeusToken();

  const response = await axios.get(
    "https://test.api.amadeus.com/v2/shopping/flight-offers",
    {
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults: 1,
        max: 5, // limit results for testing
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};