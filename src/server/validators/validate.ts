import "server-only"
import { z } from "zod"
import { BadRequestError } from "../errors/app-error"

/**
 * Validates unknown data against a Zod schema.
 * Throws ZodError if validation fails, which is formatted by handleApiError.
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Parses the JSON body from an incoming Next.js Request and validates it against a Zod schema.
 * Throws BadRequestError if the request body is not valid JSON.
 * Throws ZodError if schema validation fails.
 */
export async function parseAndValidateJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    throw new BadRequestError("Invalid JSON body. Expected a well-formed JSON payload.")
  }

  return validate(schema, rawBody)
}

/**
 * Extracts query parameters from a URL or URLSearchParams object and validates them against a Zod schema.
 * Supports scalar query params and converts URLSearchParams to a plain object.
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodType<T>,
): T {
  const params: Record<string, string | string[]> = {}

  searchParams.forEach((value, key) => {
    const existing = params[key]
    if (existing !== undefined) {
      if (Array.isArray(existing)) {
        existing.push(value)
      } else {
        params[key] = [existing, value]
      }
    } else {
      params[key] = value
    }
  })

  return validate(schema, params)
}

/**
 * Standard reusable pagination query validator schema.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

