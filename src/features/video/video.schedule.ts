export const JOIN_OPEN_MINUTES_BEFORE = 10;
export const JOIN_CLOSE_MINUTES_AFTER = 60;

function ensureNoTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function buildConsultationLink(appointmentId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const relativePath = `/consultation/${appointmentId}`;

  if (!baseUrl) {
    return relativePath;
  }

  return `${ensureNoTrailingSlash(baseUrl)}${relativePath}`;
}

export function getJoinWindow(appointmentDate: Date | string | number) {
  const date = new Date(appointmentDate);

  return {
    joinFrom: new Date(date.getTime() - JOIN_OPEN_MINUTES_BEFORE * 60 * 1000),
    joinUntil: new Date(date.getTime() + JOIN_CLOSE_MINUTES_AFTER * 60 * 1000),
  };
}
