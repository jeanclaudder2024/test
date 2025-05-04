import { ZodError } from "zod";

/**
 * Format Zod validation errors for better error response
 * @param error ZodError object
 * @returns Formatted error object
 */
export function formatZodError(error: ZodError) {
  return error.errors.reduce((acc: Record<string, string>, curr) => {
    const path = curr.path.join(".");
    acc[path] = curr.message;
    return acc;
  }, {});
}