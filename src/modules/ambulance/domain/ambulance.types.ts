import { ObjectId } from "mongodb";
import {
  AMBULANCE_BOOKING_STATUSES,
  AMBULANCE_DISPATCH_STATUSES,
  AMBULANCE_PROVIDER_APPROVAL_STATUSES,
  AMBULANCE_VEHICLE_TYPES,
} from "./ambulance.constants";

export type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type AmbulanceProviderApprovalStatus =
  (typeof AMBULANCE_PROVIDER_APPROVAL_STATUSES)[number];
export type AmbulanceDispatchStatus =
  (typeof AMBULANCE_DISPATCH_STATUSES)[number];
export type AmbulanceBookingStatus =
  (typeof AMBULANCE_BOOKING_STATUSES)[number];
export type AmbulanceVehicleType = (typeof AMBULANCE_VEHICLE_TYPES)[number];

export type AmbulanceProvider = {
  _id?: ObjectId;
  userId: ObjectId;
  displayName: string;
  organizationType: "hospital" | "private" | "individual";
  approvalStatus: AmbulanceProviderApprovalStatus;
  verification: {
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    documentsVerified: boolean;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  serviceArea: string[];
  baseLocation: GeoPoint;
  documents: {
    tradeLicenseNumber?: string | null;
    nationalId?: string | null;
    vehicleRegistration?: string | null;
  };
  moderation: {
    state: "none" | "suspended";
    reason: string | null;
    updatedAt: Date | null;
    updatedBy: ObjectId | null;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type AmbulanceVehicle = {
  _id?: ObjectId;
  providerId: ObjectId;
  vehicleNumber: string;
  vehicleType: AmbulanceVehicleType;
  capabilities: string[];
  driver: {
    name: string;
    phone: string;
    licenseNumber?: string | null;
  };
  status: "active" | "inactive";
  equipment: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type AmbulanceAvailability = {
  _id?: ObjectId;
  providerId: ObjectId;
  vehicleId: ObjectId | null;
  isOnline: boolean;
  dispatchStatus: AmbulanceDispatchStatus;
  currentLocation: GeoPoint | null;
  lastLocationAt: Date | null;
  heading: number | null;
  speedKph: number | null;
  accuracyMeters: number | null;
  heartbeatAt: Date | null;
  updatedAt: Date;
};

export type AmbulanceBookingCandidate = {
  providerId: ObjectId;
  vehicleId: ObjectId;
  distanceMeters: number;
  rank: number;
  status: "queued" | "offered" | "accepted" | "rejected" | "expired" | "skipped";
  offeredAt: Date | null;
  respondedAt: Date | null;
  expiresAt: Date | null;
};

export type AmbulanceBooking = {
  _id?: ObjectId;
  bookingCode: string;
  patientId: ObjectId;
  status: AmbulanceBookingStatus;
  pickup: {
    address: string;
    location: GeoPoint;
  };
  destination: {
    address: string;
    location: GeoPoint;
  } | null;
  contact: {
    name: string;
    phone: string;
  };
  medicalContext: {
    notes?: string;
    requestedVehicleType: AmbulanceVehicleType;
    requiresOxygen: boolean;
    requiresStretcher: boolean;
  };
  candidateProviders: AmbulanceBookingCandidate[];
  assignedProviderId: ObjectId | null;
  assignedVehicleId: ObjectId | null;
  dispatch: {
    searchRadiusMeters: number;
    offerExpiresAt: Date | null;
    reservedAt: Date | null;
    assignedAt: Date | null;
  };
  tracking: {
    lastProviderLocation: GeoPoint | null;
    lastLocationAt: Date | null;
  };
  timeline: Array<{
    type: string;
    at: Date;
    actorId: ObjectId | null;
    note?: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

export type AmbulanceLocationEvent = {
  _id?: ObjectId;
  providerId: ObjectId;
  vehicleId: ObjectId | null;
  bookingId?: ObjectId | null;
  location: GeoPoint;
  capturedAt: Date;
  source: "device" | "manual" | "system";
  accuracyMeters: number | null;
  expiresAt: Date;
};
