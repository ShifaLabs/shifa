import { StreamClient } from "@stream-io/node-sdk";

let streamClient: StreamClient | null = null;

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getStreamApiKey() {
  return getEnv("STREAM_API_KEY");
}

export function getStreamWebhookSecret() {
  return getEnv("STREAM_WEBHOOK_SECRET");
}

export function getStreamServerClient() {
  if (streamClient) return streamClient;

  const apiKey = getStreamApiKey();
  const secret = getEnv("STREAM_SECRET");

  streamClient = new StreamClient(apiKey, secret);
  return streamClient;
}

