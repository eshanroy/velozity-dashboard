import { Request, Response } from "express";
import prisma from "../config/prisma";

export const createClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, company } = req.body;

    if (!name || !email || !company) {
      res.status(400).json({
        error: "Name, email and company are required",
      });
      return;
    }

    const existingClient = await prisma.client.findUnique({
      where: {
        email,
      },
    });

    if (existingClient) {
      res.status(400).json({
        error: "Client with this email already exists",
      });
      return;
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        company,
      },
    });

    res.status(201).json({
      message: "Client created successfully",
      client,
    });
  } catch {
    res.status(500).json({
      error: "Failed to create client",
    });
  }
};

export const getClients = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      clients,
    });
  } catch {
    res.status(500).json({
      error: "Failed to fetch clients",
    });
  }
};