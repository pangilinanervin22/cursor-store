import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "bookstore_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds
const DELIMITER = "|||"; // Use a unique delimiter that won't appear in JSON

export interface SessionData {
  username: string;
  expiresAt: number;
}

/**
 * Creates a simple encoded session token
 */
function encodeSession(data: SessionData): string {
  const secret = process.env.AUTH_SECRET || "default-secret";
  const payload = JSON.stringify(data);
  // Use a unique delimiter
  return Buffer.from(`${payload}${DELIMITER}${secret}`).toString("base64");
}

/**
 * Decodes and validates a session token
 */
export function decodeSession(token: string): SessionData | null {
  try {
    const secret = process.env.AUTH_SECRET || "default-secret";
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    
    const delimiterIndex = decoded.lastIndexOf(DELIMITER);
    if (delimiterIndex === -1) {
      console.log("No delimiter found in session");
      return null;
    }
    
    const payload = decoded.substring(0, delimiterIndex);
    const tokenSecret = decoded.substring(delimiterIndex + DELIMITER.length);
    
    if (tokenSecret !== secret) {
      console.log("Secret mismatch");
      return null;
    }
    
    const data = JSON.parse(payload) as SessionData;
    
    // Check if session has expired
    if (data.expiresAt < Date.now()) {
      console.log("Session expired");
      return null;
    }
    
    return data;
  } catch (err) {
    console.log("Error decoding session:", err);
    return null;
  }
}

/**
 * Validates credentials against environment variables
 */
export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.AUTH_USERNAME || "admin";
  const validPassword = process.env.AUTH_PASSWORD || "admin123";
  
  return username === validUsername && password === validPassword;
}

/**
 * Creates a session and sets the cookie
 */
export async function createSession(username: string): Promise<void> {
  const cookieStore = await cookies();
  
  const sessionData: SessionData = {
    username,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
  
  const token = encodeSession(sessionData);
  console.log("Creating session token for:", username);
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Gets the current session from cookies
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  return decodeSession(token);
}

/**
 * Destroys the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Checks if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
