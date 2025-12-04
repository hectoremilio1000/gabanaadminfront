// src/api/auth.ts
import api from "./client";
import type { LoginResponse } from "../types/auth";

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/session", {
    email,
    password,
  });
  // guardar token
  localStorage.setItem("gabana_token", data.token);
  localStorage.setItem("gabana_user", JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem("gabana_token");
  localStorage.removeItem("gabana_user");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("gabana_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
