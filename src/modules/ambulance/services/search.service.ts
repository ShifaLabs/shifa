import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { initializeIndexes } from "@/infrastructure/db/dbIndexes";
import { ObjectId } from "mongodb";
import { ambulanceSearchQuerySchema } from "./ambulance.schemas";
import { resolveSearchCandidate } from "./ambulance.search";
import { ambulanceRepository } from "../infrastructure/ambulance.repository";

async function findNearbyProvidersByBaseLocation({
  lng,
  lat,
  maxDistance,
  limit,
}: {
  lng: number;
  lat: number;
  maxDistance: number;
  limit: number;
}) {
  const col = await dbConnect(collections.AMBULANCE_PROVIDERS);
  return col
    .find({
      baseLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    })
    .limit(limit)
    .toArray();
}

export async function searchNearbyAmbulances(rawQuery: unknown) {
  await initializeIndexes();

  const query = ambulanceSearchQuerySchema.parse(rawQuery);
  const fetchLimit = query.limit * 8;

  const [baseProviders, liveAvailabilities] = await Promise.all([
    findNearbyProvidersByBaseLocation({
      lng: query.lng,
      lat: query.lat,
      maxDistance: query.radius,
      limit: fetchLimit,
    }),
    ambulanceRepository.findNearbyAvailabilities({
      lng: query.lng,
      lat: query.lat,
      maxDistance: query.radius,
      limit: fetchLimit,
    }),
  ]);

  const providerIds = Array.from(
    new Set(
      [
        ...baseProviders.map((provider) => provider._id?.toString()),
        ...liveAvailabilities.map((availability) =>
          availability.providerId?.toString(),
        ),
      ].filter(Boolean),
    ),
  ).map((id) => new ObjectId(id));

  const [providers, availabilities] = await Promise.all([
    ambulanceRepository.findProvidersByIds(providerIds),
    Promise.all(
      providerIds.map((providerId) =>
        ambulanceRepository.findAvailabilityByProviderId(providerId),
      ),
    ),
  ]);
  const vehicleIds = availabilities
    .map((availability) => availability?.vehicleId)
    .filter((item): item is ObjectId => Boolean(item));
  const vehicles = await ambulanceRepository.findVehiclesByIds(vehicleIds);

  const providerMap = new Map(
    providers
      .filter(Boolean)
      .map((provider) => [provider!._id!.toString(), provider!]),
  );
  const availabilityMap = new Map(
    availabilities
      .filter(Boolean)
      .map((availability) => [
        availability!.providerId.toString(),
        availability!,
      ]),
  );
  const vehicleMap = new Map(
    vehicles
      .filter(Boolean)
      .map((vehicle) => [vehicle!._id!.toString(), vehicle!]),
  );

  const ambulances = providerIds
    .map((providerId) =>
      resolveSearchCandidate({
        provider: providerMap.get(providerId.toString()),
        availability: availabilityMap.get(providerId.toString()),
        vehicle: availabilityMap.get(providerId.toString())?.vehicleId
          ? vehicleMap.get(
              availabilityMap.get(providerId.toString())!.vehicleId!.toString(),
            )
          : null,
        query,
      }),
    )
    .filter(Boolean)
    .sort((a, b) => a!.distanceMeters - b!.distanceMeters)
    .slice(0, query.limit);

  return {
    radiusMeters: query.radius,
    ambulances,
    canBookImmediately: ambulances.length > 0,
  };
}
