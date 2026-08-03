import { shiprocketConfig } from "@/lib/config/shiprocket";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Get a valid Shiprocket JWT token.
 * Authenticates if no token is cached or if the token is expired.
 */
export async function getShiprocketToken(): Promise<string> {
  // If token exists and is valid for at least another 5 minutes
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  const email = shiprocketConfig.email;
  const password = shiprocketConfig.password;

  const response = await fetch(`${shiprocketConfig.baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Shiprocket Auth Error:", errorData);
    throw new Error(`Failed to authenticate with Shiprocket: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.token) {
    throw new Error("Shiprocket auth response did not contain a token.");
  }

  cachedToken = data.token;
  
  // Shiprocket tokens typically expire in 10 days, but we'll refresh every 24 hours just in case,
  // or use the server provided expiry if available.
  // Actually, Shiprocket docs don't usually return a clear expiry in seconds in this payload,
  // so we'll defensively cache for 24 hours.
  tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; 

  return cachedToken!;
}

/**
 * Base HTTP client for Shiprocket API.
 * Automatically handles authentication, retries, and JSON parsing.
 */
export async function shiprocketRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const token = await getShiprocketToken();
  
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${shiprocketConfig.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && retries > 0) {
      // Token might be invalid/expired unexpectedly. Clear cache and retry.
      cachedToken = null;
      return shiprocketRequest(endpoint, options, retries - 1);
    }

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch (e) {
        errorBody = await response.text();
      }
      
      console.error(`[Shiprocket] Error ${response.status} on ${endpoint}:`, errorBody);
      
      // Retry on 5xx errors or 429 Too Many Requests
      if ((response.status >= 500 || response.status === 429) && retries > 0) {
        await new Promise((res) => setTimeout(res, 1000 * (3 - retries))); // Exponential backoff
        return shiprocketRequest(endpoint, options, retries - 1);
      }

      throw new Error(`Shiprocket API Error: ${response.status} ${JSON.stringify(errorBody)}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    if (retries > 0 && error.message.includes("fetch failed")) {
      // Network error retry
      await new Promise((res) => setTimeout(res, 1000 * (3 - retries)));
      return shiprocketRequest(endpoint, options, retries - 1);
    }
    throw error;
  }
}
