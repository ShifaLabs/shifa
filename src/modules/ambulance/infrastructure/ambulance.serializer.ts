import { ObjectId } from "mongodb";

export function serializeAmbulanceDoc<T>(doc: T): T {
  return JSON.parse(
    JSON.stringify(doc, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }

      if (value instanceof ObjectId) {
        return value.toString();
      }

      if (
        value &&
        typeof value === "object" &&
        typeof value._bsontype === "string" &&
        value._bsontype.toLowerCase() === "objectid" &&
        typeof value.toString === "function"
      ) {
        return value.toString();
      }

      return value;
    }),
  );
}
