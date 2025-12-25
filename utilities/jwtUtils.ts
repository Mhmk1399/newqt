/**
 * JWT Utilities with proper UTF-8 support for Persian text
 */

export interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker" | "admin";
  role?: "admin" | "manager" | "editor" | "designer" | "video-shooter"; // Role field for User model
  exp: number;
  [key: string]: any;
}

/**
 * Properly decode JWT token with UTF-8 support for Persian characters
 * @param token - JWT token string
 * @returns Decoded token payload
 */
export const decodeJWT = (token: string): DecodedToken => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const base64Payload = parts[1];
    
    // Handle URL-safe base64 encoding
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    // Properly decode UTF-8 characters
    const payload = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(payload) as DecodedToken;
  } catch (error) {
    console.error('JWT decode error:', error);
    throw new Error('Invalid token format or corrupted data');
  }
};

/**
 * Get user info from localStorage token with proper UTF-8 decoding
 * @returns DecodedToken or null if not found/invalid
 */
export const getUserFromToken = (): DecodedToken | null => {
  try {
    const token = localStorage.getItem("userToken") || localStorage.getItem("token");
    
    if (!token) {
      return null;
    }

    const decoded = decodeJWT(token);

    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("userToken");
      localStorage.removeItem("token");
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error getting user from token:', error);
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");
    return null;
  }
};

/**
 * Check if token exists and is valid
 * @returns boolean
 */
export const isTokenValid = (): boolean => {
  const user = getUserFromToken();
  return user !== null;
};

/**
 * Get authorization header for API requests
 * @returns Authorization header string or null
 */
export const getAuthHeader = (): string | null => {
  const token = localStorage.getItem("userToken") || localStorage.getItem("token");
  return token ? `Bearer ${token}` : null;
};

/**
 * Logout user by removing tokens and clearing localStorage
 * @returns void
 */
export const logoutUser = (): void => {
  try {
    // Remove JWT tokens
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");
    
    // Clear any other user-related data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('user') || key.includes('auth') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

/**
 * Clean corrupted tokens from localStorage
 * Useful when tokens become malformed or corrupted
 */
export const cleanCorruptedTokens = (): void => {
  try {
    const userToken = localStorage.getItem("userToken");
    const token = localStorage.getItem("token");
    
    // Test if tokens are valid JWT format
    const isValidJWT = (token: string): boolean => {
      const parts = token.split(".");
      return parts.length === 3 && parts.every(part => part.length > 0);
    };
    
    if (userToken && !isValidJWT(userToken)) {
      console.warn("Corrupted userToken detected, removing...");
      localStorage.removeItem("userToken");
    }
    
    if (token && !isValidJWT(token)) {
      console.warn("Corrupted token detected, removing...");
      localStorage.removeItem("token");
    }
  } catch (error) {
    console.error('Error cleaning corrupted tokens:', error);
  }
};