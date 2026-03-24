import {
  findUserProfileByEmail,
  updateUserProfileByEmail,
} from "./user.profile.repository";

export async function getLoggedInUserProfile(email: string) {
  const user = await findUserProfileByEmail(email);

  if (!user) {
    return null;
  }

  return {
    ...user,
    _id: user._id?.toString?.() ?? null,
  };
}

export async function updateLoggedInUserProfile(email: string, body: any) {
  const updateDoc = {
    fullName: body.fullName ?? "",
    phone: body.phone ?? "",
    gender: body.gender ?? "",
    age: body.age ?? "",
    address: {
      street: body.street ?? "",
      city: body.city ?? "",
      country: body.country ?? "",
      zipCode: body.zipCode ?? "",
    },
    updatedAt: new Date(),
  };

  await updateUserProfileByEmail(email, updateDoc);

  return { success: true };
}
