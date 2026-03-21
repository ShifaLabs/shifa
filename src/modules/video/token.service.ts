import { getStreamServerClient } from "./stream.client";

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60;
const DEV_CLOCK_SKEW_LEEWAY_SECONDS = 15 * 60;
const PROD_CLOCK_SKEW_LEEWAY_SECONDS = 90;
const MIN_TOKEN_TTL_SECONDS = 5 * 60;

export function generateVideoToken(
  userId: string,
  ttl = DEFAULT_TOKEN_TTL_SECONDS,
) {
  const streamClient = getStreamServerClient() as any;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const isDevelopment = process.env.NODE_ENV !== "production";
  const skewLeewaySeconds = isDevelopment
    ? DEV_CLOCK_SKEW_LEEWAY_SECONDS
    : PROD_CLOCK_SKEW_LEEWAY_SECONDS;
  const safeTtl =
    Number.isFinite(ttl) && ttl > 0
      ? Math.max(Math.floor(ttl), MIN_TOKEN_TTL_SECONDS)
      : DEFAULT_TOKEN_TTL_SECONDS;

  if (typeof streamClient.generatePermanentUserToken === "function") {
    if (isDevelopment) {
      return streamClient.generatePermanentUserToken({
        user_id: userId,
        iat: nowInSeconds - skewLeewaySeconds,
      });
    }
  }

  if (typeof streamClient.generateUserToken === "function") {
    return streamClient.generateUserToken({
      user_id: userId,
      iat: nowInSeconds - skewLeewaySeconds,
      exp: nowInSeconds + safeTtl,
    });
  }

  if (typeof streamClient.createToken === "function") {
    return streamClient.createToken(
      userId,
      nowInSeconds + safeTtl,
      nowInSeconds - skewLeewaySeconds,
    );
  }

  throw new Error("Stream client does not support token generation");
}
