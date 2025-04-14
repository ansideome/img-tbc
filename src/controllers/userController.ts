import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import fs from "fs";
import path from "path";

export const getAllUsers = async (_: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  return res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return res.status(400).json({ message: "Email already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role || "USER" },
  });

  return res
    .status(201)
    .json({
      message: "User created",
      user: { id: user.id, email: user.email },
    });
};

export const updateUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const data: any = { name, email, role };
  if (password) data.password = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });
    return res.json({ message: "User updated", user });
  } catch {
    return res.status(404).json({ message: "User not found" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ message: "User deleted" });
  } catch {
    return res.status(404).json({ message: "User not found" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, profilePicture: true },
  });
  return res.json(user);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, password } = req.body;
  const data: any = { name, profilePicture: req.user?.profilePicture };

  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  if (req.file) {
    const oldProfilePicture = req.user?.profilePicture;
    const newProfilePicPath = `/uploads/${req.file.filename}`;

    if (oldProfilePicture && fs.existsSync(path.join("src", oldProfilePicture))) {
      fs.unlinkSync(path.join("src", oldProfilePicture));
    }

    data.profilePicture = newProfilePicPath;
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
    });

    return res.json({
      message: "Profile updated",
      user: { id: user.id, name: user.name, profilePicture: user.profilePicture },
    });
  } catch (err) {
    return res.status(404).json({ message: "User not found" });
  }
};
