import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import scrapperRoute from "./routes/scrap-link";

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "8080", 10);
const allowedOrigins: string[] = ["http://localhost:3000"];

// Custom error class
class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

// Middleware types
interface ApiKeyRequest extends Request {
  apiKey?: string;
}

// API key middleware
const authenticateApiKey = (
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers["x-api-key"] as string;
  const API_KEY = process.env.API_KEY;

  if (!apiKey) {
    next(new ApiError(401, "API key is missing"));
    return;
  }

  if (apiKey !== API_KEY) {
    next(new ApiError(403, "Invalid API key"));
    return;
  }

  next();
};

// Security headers middleware
const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent browsers from detecting the MIME type
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS filter in browser
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict Transport Security
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Restrict browser features
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=()");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none';"
  );

  next();
};

// CORS options type
const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securityHeaders);

// Apply API key authentication to all routes under /api
app.use("/api", authenticateApiKey, scrapperRoute);

// Error handling middleware
app.use(
  (err: ApiError | Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    if (err instanceof ApiError) {
      res.status(err.statusCode).json({
        message: err.message,
        error: err.name,
      });
    } else {
      res.status(500).json({
        message: "Something went wrong!",
        error: err.message,
      });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
