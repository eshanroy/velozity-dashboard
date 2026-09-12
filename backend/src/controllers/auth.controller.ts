import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
} from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        error: "Name, email and password are required",
      });
      return;
    }

    const user = await registerUser({
  name,
  email,
  password,
});

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    res.status(400).json({
      error: message,
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "Email and password are required",
      });
      return;
    }

    const result = await loginUser({
      email,
      password,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    res.status(401).json({
      error: message,
    });
  }
};

export const logout = (
  _req: Request,
  res: Response
): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    message: "Logout successful",
  });
};