const express = require("express");
const cors = require("cors");
const scrapperRoute = require("./routes/scrapperServiceRouter");
const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = ["http://localhost:3000"];

// API key middleware
const API_KEY = "your-secret-api-key"; // Store this in environment variables in production

const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ message: "API key is missing" });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securityHeaders);

// Apply API key authentication to all routes under /api
app.use("/api", authenticateApiKey, scrapperRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
