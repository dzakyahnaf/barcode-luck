import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

let _ipRateLimiter: Ratelimit | null = null;
let _phoneRateLimiter: Ratelimit | null = null;

export function getIpRateLimiter(): Ratelimit {
  if (!_ipRateLimiter) {
    _ipRateLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "rl:ip",
    });
  }
  return _ipRateLimiter;
}

export function getPhoneRateLimiter(): Ratelimit {
  if (!_phoneRateLimiter) {
    _phoneRateLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(1, "24 h"),
      prefix: "rl:phone",
    });
  }
  return _phoneRateLimiter;
}

// Keep named exports for backwards compat in the spin route
export const ipRateLimiter = {
  limit: (key: string) => getIpRateLimiter().limit(key),
};

export const phoneRateLimiter = {
  limit: (key: string) => getPhoneRateLimiter().limit(key),
};
