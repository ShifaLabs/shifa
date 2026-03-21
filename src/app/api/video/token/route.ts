import { createVideoToken } from "@/modules/video/services/video-token-handler.service";

export async function POST(req: Request) {
  return createVideoToken(req);
}
