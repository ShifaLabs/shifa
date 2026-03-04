export const AppointmentStatus = {
  PendingPayment: "PendingPayment",
  Approved: "Approved",
  Confirmed: "Confirmed",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Expired: "Expired",
};

export const allowedTransitions = {
  PendingPayment: ["Approved", "Cancelled", "Expired"],
  Approved: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
  Expired: [],
};

export function canTransition(from, to) {
  return allowedTransitions[from]?.includes(to);
}
