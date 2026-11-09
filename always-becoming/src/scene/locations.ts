/** City-level associations, not exact campus coordinates or an itinerary. */
export const LOCATION_POINTS = [
  { id: "hyderabad", label: "Hyderabad", latitude: 17.385, longitude: 78.4867 },
  { id: "london", label: "London", latitude: 51.5072, longitude: -0.1276 },
  { id: "newyork", label: "New York", latitude: 40.7128, longitude: -74.006 },
  {
    id: "philadelphia",
    label: "Philadelphia",
    latitude: 39.9526,
    longitude: -75.1652,
  },
  { id: "naples", label: "Naples", latitude: 40.8518, longitude: 14.2681 },
  { id: "parma", label: "Parma", latitude: 44.8015, longitude: 10.3279 },
  { id: "rome", label: "Rome", latitude: 41.9028, longitude: 12.4964 },
] as const;

export type LocationId = (typeof LOCATION_POINTS)[number]["id"];
