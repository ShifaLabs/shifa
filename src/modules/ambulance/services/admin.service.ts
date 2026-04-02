import { ObjectId } from "mongodb";
import { ambulanceProviderModerationSchema } from "./ambulance.schemas";
import { ambulanceRepository } from "../infrastructure/ambulance.repository";
import { createHttpError } from "../application/ambulance.shared";

export async function listAdminAmbulanceProviders(status?: string) {
  const filter: Record<string, unknown> = {};
  if (status) {
    filter.approvalStatus = status;
  }

  return ambulanceRepository.listProviders(filter);
}

export async function moderateAmbulanceProvider(
  providerId: string,
  adminId: string,
  rawData: unknown,
) {
  const parsed = ambulanceProviderModerationSchema.parse(rawData);
  const provider = await ambulanceRepository.findProviderById(providerId);

  if (!provider) {
    throw createHttpError("Provider not found", 404);
  }

  await ambulanceRepository.updateProvider(provider._id!, {
    approvalStatus: parsed.action,
    moderation: {
      state: parsed.action === "suspended" ? "suspended" : "none",
      reason: parsed.reason || null,
      updatedAt: new Date(),
      updatedBy: new ObjectId(adminId),
    },
    verification: {
      ...provider.verification,
      documentsVerified: parsed.action === "approved",
    },
  });

  if (parsed.action === "approved") {
    await ambulanceRepository.updateUserRole(
      provider.userId,
      "ambulance_provider",
    );
  } else if (["rejected", "suspended"].includes(parsed.action)) {
    await ambulanceRepository.updateUserRole(provider.userId, "patient");
    await ambulanceRepository.upsertAvailability(provider._id!, {
      isOnline: false,
      dispatchStatus: "offline",
      heartbeatAt: null,
    });
  }

  await ambulanceRepository.insertDispatchEvent({
    providerId: provider._id!,
    type: `provider.${parsed.action}`,
    reason: parsed.reason || null,
    actorId: new ObjectId(adminId),
  });

  return ambulanceRepository.findProviderById(providerId);
}
