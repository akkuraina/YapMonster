// Configuration file for API endpoints
const config = {
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
};

// Debug logging
console.log("Environment variable REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);
console.log("Using BACKEND_URL:", config.BACKEND_URL);

export default config; 