import { NextResponse } from "next/server";

/**
 * Standardized API response helpers
 */
export class ApiResponse {
  /**
   * Success response
   */
  static success<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        message: message || "Request successful",
        data,
      },
      { status },
    );
  }

  /**
   * Error response
   */
  static error(message: string, status: number = 500, details?: any) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        details,
      },
      { status },
    );
  }

  /**
   * Validation error response
   */
  static validationError(message: string, errors: any[]) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        validationErrors: errors,
      },
      { status: 400 },
    );
  }

  /**
   * Unauthorized response
   */
  static unauthorized(message: string = "Unauthorized access") {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 401 },
    );
  }

  /**
   * Forbidden response
   */
  static forbidden(message: string = "Access forbidden") {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 403 },
    );
  }

  /**
   * Not found response
   */
  static notFound(resource: string = "Resource") {
    return NextResponse.json(
      {
        success: false,
        error: `${resource} not found`,
      },
      { status: 404 },
    );
  }

  /**
   * Created response
   */
  static created<T>(data: T, message?: string) {
    return this.success(data, message || "Resource created successfully", 201);
  }

  /**
   * No content response
   */
  static noContent() {
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Conflict response
   */
  static conflict(message: string) {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 409 },
    );
  }
}
