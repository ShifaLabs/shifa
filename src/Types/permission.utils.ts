// src/lib/permission.utils.ts

import { Permission } from "@/config/permissions";

export function hasPermission(
  userPermissions: Permission[],
  required?: Permission[],
) {
  if (!required || required.length === 0) return true;

  return required.every((perm) => userPermissions.includes(perm));
}
