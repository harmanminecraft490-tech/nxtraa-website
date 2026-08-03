export interface ShiprocketConfig {
  email: string;
  password: string;
  baseUrl: string;
  webhookSecret?: string;
}

export const shiprocketConfig = {
  get email() {
    const email = process.env.SHIPROCKET_API_EMAIL;
    if (!email) {
      throw new Error(
        "Missing required environment variable: SHIPROCKET_API_EMAIL. " +
        "Please provide the API User Email generated from the Shiprocket API Users section."
      );
    }
    return email;
  },
  
  get password() {
    const password = process.env.SHIPROCKET_API_PASSWORD;
    if (!password) {
      throw new Error(
        "Missing required environment variable: SHIPROCKET_API_PASSWORD. " +
        "Please provide the API Password generated from the Shiprocket API Users section."
      );
    }
    return password;
  },
  
  get baseUrl() {
    return process.env.SHIPROCKET_API_BASE_URL || "https://apiv2.shiprocket.in/v1/external";
  },
  
  get webhookSecret() {
    return process.env.SHIPROCKET_WEBHOOK_SECRET;
  }
};
