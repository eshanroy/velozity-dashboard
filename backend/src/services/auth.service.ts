import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (input: RegisterInput) => {
  const { name, email, password } = input;
  const role = Role.DEVELOPER;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};