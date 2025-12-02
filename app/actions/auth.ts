"use server";

import { redirect } from "next/navigation";
import {
  validateCredentials,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";

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
  console.log("Login attempt for:", username);
  
  if (!username || !password) {
    console.log("Missing credentials");
    return { success: false, error: "Username and password are required" };
  }

  const isValid = validateCredentials(username, password);
  console.log("Credentials valid:", isValid);
  
  if (!isValid) {
    return { success: false, error: "Invalid username or password" };
  }

  try {
    await createSession(username);
    console.log("Session created successfully");
    return { success: true };
  } catch (err) {
    console.error("Error creating session:", err);
    return { success: false, error: "Failed to create session" };
  }
}

/**
 * Handles user logout
 */
export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

/**
 * Gets current user info
 */
export async function getCurrentUser(): Promise<{ username: string } | null> {
  const session = await getSession();
  if (!session) return null;
  return { username: session.username };
}
