import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets are not configured");
}

export const generateAccessToken = (userId: string, role: Role): string => {
  return jwt.sign(
    {
      userId,
      role,
    },
    ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (userId: string, role: Role): string => {
  return jwt.sign(
    {
      userId,
      role,
    },
    REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as {
    userId: string;
    role: Role;
  };
};