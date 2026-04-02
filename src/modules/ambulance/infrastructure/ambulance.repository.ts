import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { ObjectId } from "mongodb";
import {
  AmbulanceAvailability,
  AmbulanceBooking,
  AmbulanceLocationEvent,
  AmbulanceProvider,
  AmbulanceVehicle,
} from "../domain/ambulance.types";

function toObjectId(id: string | ObjectId) {
  return typeof id === "string" ? new ObjectId(id) : id;
}

export const ambulanceRepository = {
  async findProviderByUserId(userId: string | ObjectId) {
    const col = await dbConnect(collections.AMBULANCE_PROVIDERS);
    return col.findOne<AmbulanceProvider>({ userId: toObjectId(userId) });
  },

  async findProviderById(providerId: string | ObjectId) {
    const col = await dbConnect(collections.AMBULANCE_PROVIDERS);
    return col.findOne<AmbulanceProvider>({ _id: toObjectId(providerId) });
  },

  async findProvidersByIds(providerIds: Array<string | ObjectId>) {
    if (!providerIds.length) return [];
    const col = await dbConnect(collections.AMBULANCE_PROVIDERS);
    return col
      .find<AmbulanceProvider>({
        _id: { $in: providerIds.map((providerId) => toObjectId(providerId)) },
      })
      .toArray();
  },

  async createProvider(provider: AmbulanceProvider) {
    const col = await dbConnect(collections.AMBULANCE_PROVIDERS);
    return col.insertOne(provider);
  },

  async updateProvider(
    providerId: string | ObjectId,
    update: Partial<AmbulanceProvider>,
  ) {
    const col = await dbConnect(collections.AMBULANCE_PROVIDERS);
    return col.findOneAndUpdate(
      { _id: toObjectId(providerId) },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
  },

  async listProviders(filter: Record<string, unknown> = {}) {
    const col = await dbConnect(collections.AMBULANCE_PROVIDERS);
    return col
      .find<AmbulanceProvider>(filter)
      .sort({ createdAt: -1 })
      .toArray();
  },

  async createVehicle(vehicle: AmbulanceVehicle) {
    const col = await dbConnect(collections.AMBULANCE_VEHICLES);
    return col.insertOne(vehicle);
  },

  async findVehicleById(vehicleId: string | ObjectId) {
    const col = await dbConnect(collections.AMBULANCE_VEHICLES);
    return col.findOne<AmbulanceVehicle>({ _id: toObjectId(vehicleId) });
  },

  async findVehiclesByIds(vehicleIds: Array<string | ObjectId>) {
    if (!vehicleIds.length) return [];
    const col = await dbConnect(collections.AMBULANCE_VEHICLES);
    return col
      .find<AmbulanceVehicle>({
        _id: { $in: vehicleIds.map((vehicleId) => toObjectId(vehicleId)) },
      })
      .toArray();
  },

  async findVehiclesByProviderId(providerId: string | ObjectId) {
    const col = await dbConnect(collections.AMBULANCE_VEHICLES);
    return col
      .find<AmbulanceVehicle>({ providerId: toObjectId(providerId) })
      .toArray();
  },

  async updateVehicle(
    vehicleId: string | ObjectId,
    update: Partial<AmbulanceVehicle>,
  ) {
    const col = await dbConnect(collections.AMBULANCE_VEHICLES);
    return col.findOneAndUpdate(
      { _id: toObjectId(vehicleId) },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
  },

  async upsertAvailability(
    providerId: string | ObjectId,
    payload: Partial<AmbulanceAvailability>,
  ) {
    const col = await dbConnect(collections.AMBULANCE_AVAILABILITY);
    return col.findOneAndUpdate(
      { providerId: toObjectId(providerId) },
      {
        $set: { ...payload, updatedAt: new Date() },
        $setOnInsert: { providerId: toObjectId(providerId) },
      },
      { upsert: true, returnDocument: "after" },
    );
  },

  async findAvailabilityByProviderId(providerId: string | ObjectId) {
    const col = await dbConnect(collections.AMBULANCE_AVAILABILITY);
    return col.findOne<AmbulanceAvailability>({
      providerId: toObjectId(providerId),
    });
  },

  async findNearbyAvailabilities({
    lng,
    lat,
    maxDistance,
    limit,
    vehicleIds,
  }: {
    lng: number;
    lat: number;
    maxDistance: number;
    limit: number;
    vehicleIds?: ObjectId[];
  }) {
    const col = await dbConnect(collections.AMBULANCE_AVAILABILITY);
    const filter: Record<string, unknown> = {
      isOnline: true,
      dispatchStatus: "idle",
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    };

    if (vehicleIds?.length) {
      filter.vehicleId = { $in: vehicleIds };
    }

    return col.find<AmbulanceAvailability>(filter).limit(limit).toArray();
  },

  async createBooking(booking: AmbulanceBooking) {
    const col = await dbConnect(collections.AMBULANCE_BOOKINGS);
    return col.insertOne(booking);
  },

  async findBookingById(bookingId: string | ObjectId) {
    const col = await dbConnect(collections.AMBULANCE_BOOKINGS);
    return col.findOne<AmbulanceBooking>({ _id: toObjectId(bookingId) });
  },

  async findBookings(filter: Record<string, unknown>) {
    const col = await dbConnect(collections.AMBULANCE_BOOKINGS);
    return col.find<AmbulanceBooking>(filter).sort({ createdAt: -1 }).toArray();
  },

  async updateBooking(
    bookingId: string | ObjectId,
    update: Partial<AmbulanceBooking>,
  ) {
    const col = await dbConnect(collections.AMBULANCE_BOOKINGS);
    return col.findOneAndUpdate(
      { _id: toObjectId(bookingId) },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
  },

  async insertLocationEvent(event: AmbulanceLocationEvent) {
    const col = await dbConnect(collections.AMBULANCE_LOCATION_EVENTS);
    return col.insertOne(event);
  },

  async insertDispatchEvent(payload: Record<string, unknown>) {
    const col = await dbConnect(collections.AMBULANCE_DISPATCH_EVENTS);
    return col.insertOne({ ...payload, createdAt: new Date() });
  },

  async updateUserRole(userId: string | ObjectId, role: string) {
    const col = await dbConnect(collections.USERS);
    return col.updateOne(
      { _id: toObjectId(userId) },
      { $set: { role, updatedAt: new Date() } },
    );
  },
};
