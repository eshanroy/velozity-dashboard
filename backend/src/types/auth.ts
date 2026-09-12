import { Role } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface AuthenticatedRequest {
  userId: string;
  role: Role;
}