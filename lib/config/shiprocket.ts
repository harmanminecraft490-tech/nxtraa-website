export interface ShiprocketConfig {
  email: string;
  password: string;
  baseUrl: string;
  webhookSecret?: string;
}

function loadConfig(): ShiprocketConfig {
  const email = process.env.SHIPROCKET_API_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD;
  const baseUrl = process.env.SHIPROCKET_API_BASE_URL || "https://apiv2.shiprocket.in/v1/external";
  const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;

  if (!email) {
    throw new Error(
      "Missing required environment variable: SHIPROCKET_API_EMAIL. " +
      "Please provide the API User Email generated from the Shiprocket API Users section."
    );
  }

  if (!password) {
    throw new Error(
      "Missing required environment variable: SHIPROCKET_API_PASSWORD. " +
      "Please provide the API Password generated from the Shiprocket API Users section."
    );
  }

  return {
    email,
    password,
    baseUrl,
    webhookSecret,
  };
}

export const shiprocketConfig = loadConfig();
