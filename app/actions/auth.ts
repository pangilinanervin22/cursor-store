"use server";

import { redirect } from "next/navigation";
import {
  validateCredentials,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";

// Logger helper
function log(action: string, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : "";
  console.log(`[${timestamp}] [ACTION: ${action}] ${message}${dataStr}`);
}

function logError(action: string, message: string, error: unknown) {
  const timestamp = new Date().toISOString();
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error(`[${timestamp}] [ACTION: ${action}] ERROR: ${message} | ${errorMsg}`);
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * Handles user login - returns result, redirect handled by client
 */
export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  const ACTION = "login";
  log(ACTION, "Login attempt initiated", { username });
  
  if (!username || !password) {
    log(ACTION, "Missing credentials", { hasUsername: !!username, hasPassword: !!password });
    return { success: false, error: "Username and password are required" };
  }

  const isValid = validateCredentials(username, password);
  log(ACTION, "Credentials validation result", { username, isValid });
  
  if (!isValid) {
    log(ACTION, "Invalid credentials provided", { username });
    return { success: false, error: "Invalid username or password" };
  }

  try {
    await createSession(username);
    log(ACTION, "Session created successfully", { username });
    return { success: true };
  } catch (err) {
    logError(ACTION, "Failed to create session", err);
    return { success: false, error: "Failed to create session" };
  }
}

/**
 * Handles user logout
 */
export async function logout(): Promise<void> {
  const ACTION = "logout";
  log(ACTION, "Logout initiated");
  
  try {
    await destroySession();
    log(ACTION, "Session destroyed successfully");
  } catch (err) {
    logError(ACTION, "Error destroying session", err);
  }
  
  redirect("/login");
}

/**
 * Gets current user info
 */
export async function getCurrentUser(): Promise<{ username: string } | null> {
  const ACTION = "getCurrentUser";
  log(ACTION, "Fetching current user...");
  
  const session = await getSession();
  
  if (!session) {
    log(ACTION, "No active session found");
    return null;
  }
  
  log(ACTION, "Current user retrieved", { username: session.username });
  return { username: session.username };
}
