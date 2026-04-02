import { AmbulanceBookingStatus } from "./ambulance.types";

const allowedTransitions: Record<
  AmbulanceBookingStatus,
  AmbulanceBookingStatus[]
> = {
  requested: ["searching", "cancelled", "expired"],
  searching: ["offered", "expired", "cancelled"],
  offered: ["assigned", "searching", "expired", "cancelled"],
  assigned: ["provider_en_route", "cancelled"],
  provider_en_route: ["arrived", "cancelled"],
  arrived: ["patient_onboard", "cancelled"],
  patient_onboard: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  expired: [],
};

export function canTransitionBookingStatus(
  from: AmbulanceBookingStatus,
  to: AmbulanceBookingStatus,
) {
  return allowedTransitions[from]?.includes(to) ?? false;
}
