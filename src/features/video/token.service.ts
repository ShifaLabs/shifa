import { getStreamServerClient } from "./stream.client";

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60;
const CLOCK_SKEW_LEEWAY_SECONDS = 60;
const MIN_TOKEN_TTL_SECONDS = 5 * 60;

export function generateVideoToken(userId: string, ttl = DEFAULT_TOKEN_TTL_SECONDS) {
  const streamClient = getStreamServerClient() as any;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const safeTtl =
    Number.isFinite(ttl) && ttl > 0
      ? Math.max(Math.floor(ttl), MIN_TOKEN_TTL_SECONDS)
      : DEFAULT_TOKEN_TTL_SECONDS;

  if (typeof streamClient.generatePermanentUserToken === "function") {
    if (process.env.NODE_ENV !== "production") {
      return streamClient.generatePermanentUserToken({ user_id: userId });
    }
  }

  if (typeof streamClient.generateUserToken === "function") {
    return streamClient.generateUserToken({
      user_id: userId,
      iat: nowInSeconds - CLOCK_SKEW_LEEWAY_SECONDS,
      exp: nowInSeconds + safeTtl,
    });
  }

  if (typeof streamClient.createToken === "function") {
    return streamClient.createToken(
      userId,
      nowInSeconds + safeTtl,
      nowInSeconds - CLOCK_SKEW_LEEWAY_SECONDS,
    );
  }

  throw new Error("Stream client does not support token generation");
}

