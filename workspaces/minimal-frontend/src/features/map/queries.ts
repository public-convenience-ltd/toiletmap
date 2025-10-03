export const FIND_NEARBY_LOOS = `
  query findLoosNearby($lat: Float!, $lng: Float!, $radius: Int!) {
    loosByProximity(from: { lat: $lat, lng: $lng, maxDistance: $radius }) {
      id
      name
      location {
        lat
        lng
      }
      accessible
      babyChange
      radar
      noPayment
    }
  }
`;

export interface LooLocation {
  lat: number;
  lng: number;
}

export interface Loo {
  id: string;
  name?: string | null;
  location: LooLocation;
  accessible?: boolean | null;
  babyChange?: boolean | null;
  radar?: boolean | null;
  noPayment?: boolean | null;
}

export interface FindNearbyLoosResponse {
  loosByProximity: Loo[];
}
