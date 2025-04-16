import { Request, Response } from "express";
import prisma from "../config/prisma";
import path from "path";
import fs from "fs";
import { AuthRequest } from "../middlewares/authMiddleware";

export const uploadPhoto = async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const filePath = `/uploads/${req.file.filename}`;

  const photo = await prisma.photo.create({
    data: {
      userId: req.user!.id,
      url: filePath,
    },
  });

  return res.status(201).json({ message: "Photo uploaded", photo });
};

export const getMyPhotos = async (req: AuthRequest, res: Response) => {
  const photos = await prisma.photo.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });

  return res.json(photos);
};

export const getUserPhotos = async (req: Request, res: Response) => {
  const { id } = req.params;
  const photos = await prisma.photo.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
  });

  return res.json(photos);
};

export const deletePhoto = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo || photo.userId !== req.user!.id)
    return res.status(403).json({ message: "Not allowed" });

  const filePath = path.join("src", photo.url);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.photo.delete({ where: { id } });

  return res.json({ message: "Photo deleted" });
};

export const getAllUserPhotos = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const totalUsers = await prisma.user.count();
  const users = await prisma.user.findMany({
    skip: offset,
    take: limit,
  });

  const photosByUser = await Promise.all(
    users.map(async (user) => {
      const photos = await prisma.photo.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 7,
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        photos,
      };
    })
  );

  return res.json({
    data: photosByUser,
    pagination: {
      total: totalUsers,
      page,
      lastPage: Math.ceil(totalUsers / limit),
    },
  });
};
