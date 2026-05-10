import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: "fail",
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per hour for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many login attempts from this IP, please try again after an hour",
  },
});

export const qrLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per hour for QR verification
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many QR verification attempts from this IP, please try again after an hour",
  },
});
