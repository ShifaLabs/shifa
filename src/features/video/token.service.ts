import { getStreamServerClient } from "./stream.client";

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60;

export function generateVideoToken(userId: string, ttl = DEFAULT_TOKEN_TTL_SECONDS) {
  const streamClient = getStreamServerClient() as any;
  const exp = Math.floor(Date.now() / 1000) + ttl;

  if (typeof streamClient.generateUserToken === "function") {
    try {
      return streamClient.generateUserToken({
        user_id: userId,
        exp,
      });
    } catch {
      return streamClient.generateUserToken(userId);
    }
  }

  throw new Error("Stream client does not support token generation");
}

