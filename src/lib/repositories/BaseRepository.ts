import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { logger } from "../api/logger";

/**
 * Base repository class for database operations
 * Provides common CRUD operations with proper error handling
 */
export class BaseRepository<T extends { _id?: ObjectId }> {
  constructor(protected collection: Collection<T>) {}

  /**
   * Find one document by ID
   */
  async findById(id: string | ObjectId): Promise<T | null> {
    try {
      const _id = typeof id === "string" ? new ObjectId(id) : id;
      return (await this.collection.findOne({ _id } as any)) as T | null;
    } catch (error) {
      logger.error(`Error finding document by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find one document by filter
   */
  async findOne(filter: Partial<T>): Promise<T | null> {
    try {
      return (await this.collection.findOne(filter as any)) as T | null;
    } catch (error) {
      logger.error("Error finding document:", error);
      throw error;
    }
  }

  /**
   * Find multiple documents
   */
  async find(
    filter: Partial<T> = {},
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    },
  ): Promise<T[]> {
    try {
      let query = this.collection.find(filter as any);

      if (options?.sort) {
        query = query.sort(options.sort);
      }

      if (options?.skip) {
        query = query.skip(options.skip);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      return (await query.toArray()) as T[];
    } catch (error) {
      logger.error("Error finding documents:", error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  async create(data: Omit<T, "_id">): Promise<T> {
    try {
      const result = await this.collection.insertOne(data as any);
      return { ...data, _id: result.insertedId } as unknown as T;
    } catch (error) {
      logger.error("Error creating document:", error);
      throw error;
    }
  }

  /**
   * Update a document by ID
   */
  async updateById(id: string | ObjectId, data: Partial<T>): Promise<T | null> {
    try {
      const _id = typeof id === "string" ? new ObjectId(id) : id;
      const result = await this.collection.findOneAndUpdate(
        { _id } as any,
        { $set: data },
        { returnDocument: "after" },
      );

      return (result as T) || null;
    } catch (error) {
      logger.error(`Error updating document by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Update one document by filter
   */
  async updateOne(filter: Partial<T>, data: Partial<T>): Promise<T | null> {
    try {
      const result = await this.collection.findOneAndUpdate(
        filter as any,
        { $set: data },
        { returnDocument: "after" },
      );

      return (result as T) || null;
    } catch (error) {
      logger.error("Error updating document:", error);
      throw error;
    }
  }

  /**
   * Delete a document by ID
   */
  async deleteById(id: string | ObjectId): Promise<boolean> {
    try {
      const _id = typeof id === "string" ? new ObjectId(id) : id;
      const result = await this.collection.deleteOne({ _id } as any);
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Error deleting document by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Count documents
   */
  async count(filter: Partial<T> = {}): Promise<number> {
    try {
      return await this.collection.countDocuments(filter as any);
    } catch (error) {
      logger.error("Error counting documents:", error);
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async exists(filter: Partial<T>): Promise<boolean> {
    try {
      const count = await this.collection.countDocuments(filter as any, {
        limit: 1,
      });
      return count > 0;
    } catch (error) {
      logger.error("Error checking document existence:", error);
      throw error;
    }
  }

  /**
   * Aggregate query
   */
  async aggregate<R = any>(pipeline: any[]): Promise<R[]> {
    try {
      return await this.collection.aggregate<R>(pipeline).toArray();
    } catch (error) {
      logger.error("Error in aggregation:", error);
      throw error;
    }
  }
}

/**
 * Example: User Repository
 */
export interface User {
  _id?: ObjectId;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  isVerified: boolean;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email: email.toLowerCase() } as any);
  }

  async findVerifiedByEmail(email: string): Promise<User | null> {
    return this.findOne({
      email: email.toLowerCase(),
      isVerified: true,
    } as any);
  }

  async updateLastLogin(userId: string | ObjectId): Promise<void> {
    await this.updateById(userId, { updatedAt: new Date() } as any);
  }
}

/**
 * Repository factory to get repository instances
 */
export class RepositoryFactory {
  constructor(private db: Db) {}

  getUserRepository(): UserRepository {
    return new UserRepository(this.db.collection<User>("users"));
  }

  getAppointmentRepository() {
    return new BaseRepository(this.db.collection("appointments"));
  }

  getDoctorAvailabilityRepository() {
    return new BaseRepository(this.db.collection("doctorAvailabilities"));
  }
}
