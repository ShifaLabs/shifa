// src/lib/authorize.ts

import {
  ROLE_PERMISSIONS,
  Role,
} from "@/infrastructure/config/role-permissions";
import { Permission } from "@/infrastructure/config/permissions";

export function authorize(role: Role, required: Permission[]) {
  const permissions = ROLE_PERMISSIONS[role];

  const allowed = required.every((p) => permissions.includes(p));

  if (!allowed) {
    throw new Error("Unauthorized");
  }
}
