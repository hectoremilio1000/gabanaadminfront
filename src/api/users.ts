// /Users/hectoremilio/Proyectos/vite/gabana-admin/src/api/users.ts
import api from "./client";
import type { UserDTO } from "../types/auth";

export type CreateUserPayload = {
  fullName: string;
  email: string;
  password: string;
  role?: UserDTO["role"];
};

export async function fetchUsers(): Promise<UserDTO[]> {
  const { data } = await api.get<UserDTO[]>("/users");
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<UserDTO> {
  const { data } = await api.post<UserDTO>("/users", payload);
  return data;
}
