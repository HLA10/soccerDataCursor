/**
 * Simple in-memory rate limiting utility
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: Request) => string // Custom key generator
}

/**
 * Rate limit middleware
 * @param options Rate limit configuration
 * @returns Response or null if within limit
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options

  return async (request: Request | { url?: string; headers: Headers }): Promise<Response | null> => {
    const key = keyGenerator
      ? keyGenerator(request as Request)
      : getDefaultKey(request)

    const now = Date.now()
    const record = store[key]

    // Clean up expired entries periodically (every 1000 requests)
    if (Math.random() < 0.001) {
      cleanupExpiredEntries(now)
    }

    if (!record || now > record.resetTime) {
      // Create new record
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      }
      return null // Within limit
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": record.resetTime.toString(),
          },
        }
      )
    }

    // Increment count
    record.count++
    return null // Within limit
  }
}

function getDefaultKey(request: Request | { url?: string; headers: Headers }): string {
  // Use IP address and pathname as key
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown"
  // Handle both Request (with url) and NextRequest (with nextUrl)
  let path = "/"
  if (request instanceof Request) {
    path = new URL(request.url).pathname
  } else if (request.url) {
    try {
      path = new URL(request.url).pathname
    } catch {
      path = "/"
    }
  }
  return `${ip}:${path}`
}

function cleanupExpiredEntries(now: number): void {
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

// Pre-configured rate limiters
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  keyGenerator: (request: Request | { headers: Headers }) => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown"
    return `login:${ip}`
  },
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
})

export const strictApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 requests per minute
})
