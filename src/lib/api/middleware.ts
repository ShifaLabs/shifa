import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth.config";
import { ZodSchema } from "zod";
import { ApiResponse } from "./response";
import { logger } from "./logger";

/**
 * Middleware to check if user is authenticated
 */
export function withAuth(
  handler: (req: NextRequest, session: any) => Promise<Response>,
) {
  return async (req: NextRequest) => {
    let session: any;

    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      logger.error("Auth middleware error:", error);
      return ApiResponse.error("Authentication failed");
    }

    if (!session || !session.user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    // Let downstream handlers/middleware handle business errors explicitly.
    return await handler(req, session);
  };
}

/**
 * Middleware to check user role
 */
export function withRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (handler: (req: NextRequest, session: any) => Promise<Response>) => {
    return withAuth(async (req, session) => {
      if (!allowedRoles.includes(session.user.role)) {
        return ApiResponse.forbidden(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        );
      }

      return await handler(req, session);
    });
  };
}

/**
 * Middleware to validate request body with Zod schema
 */
export function withValidation<T>(schema: ZodSchema<T>) {
  return (
    handler: (req: NextRequest, data: T, ...args: any[]) => Promise<Response>,
  ) => {
    return async (req: NextRequest, ...args: any[]) => {
      try {
        const body = await req.json();
        const validated = schema.parse(body);

        return await handler(req, validated, ...args);
      } catch (error: any) {
        if (error.name === "ZodError") {
          const errors = error.errors.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          return ApiResponse.validationError("Validation failed", errors);
        }

        logger.error("Validation middleware error:", error);
        return ApiResponse.error("Invalid request data");
      }
    };
  };
}

/**
 * Middleware to catch and handle errors
 */
export function withErrorHandling(
  handler: (...args: any[]) => Promise<Response>,
) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      logger.error("Request handler error:", error);

      if (error.code === "ECONNREFUSED") {
        return ApiResponse.error("Database connection failed", 503);
      }

      if (error.name === "MongoError") {
        return ApiResponse.error("Database operation failed", 500);
      }

      return ApiResponse.error(
        error.message || "Internal server error",
        error.status || 500,
      );
    }
  };
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: Function[]) {
  return (handler: Function) => {
    return middlewares.reduceRight(
      (wrapped, middleware) => middleware(wrapped),
      handler,
    );
  };
}

/**
 * Rate limiting middleware (simple in-memory implementation)
 * For production, use Redis or similar
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000,
) {
  return (handler: Function) => {
    return async (req: NextRequest, ...args: any[]) => {
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      const now = Date.now();

      const record = requestCounts.get(ip);

      if (!record || now > record.resetAt) {
        requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      } else {
        record.count++;

        if (record.count > maxRequests) {
          return ApiResponse.error("Too many requests", 429);
        }
      }

      // Cleanup old entries periodically
      if (Math.random() < 0.01) {
        for (const [key, value] of requestCounts.entries()) {
          if (now > value.resetAt) {
            requestCounts.delete(key);
          }
        }
      }

      return await handler(req, ...args);
    };
  };
}
