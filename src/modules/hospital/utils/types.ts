export type Position = {
  lat: number;
  lng: number;
};

export type NearbyHospital = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type NearbyHospitalWithDistance = NearbyHospital & {
  distanceKm: number;
};
