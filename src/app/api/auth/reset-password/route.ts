import { handleResetPasswordRequest } from "@/modules/auth/services/auth-api.service";

export async function POST(req: Request) {
  return handleResetPasswordRequest(req);
}
