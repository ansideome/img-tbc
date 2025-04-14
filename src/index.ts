import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import photoRoute from "./routes/photoRoute";
import prisma from "./config/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("src/uploads"));

// Health Check
// app.get("/", (_, res) => res.send("Foto Sharing API is running 🚀"));

// TODO: Tambah route di sini
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/photos", photoRoute);

app.use("/uploads", express.static("src/uploads"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
