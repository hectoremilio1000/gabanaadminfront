// src/types/auth.ts
export type UserDTO = {
  id: number;
  fullName: string;
  email: string;
  role: "superadmin" | "staff" | "publisher";
};

export type LoginResponse = {
  token: string;
  user: UserDTO;
};
