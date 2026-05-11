import express from "express";
import "dotenv/config";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import healthRoutes from "./routes/health.route";
import uploadRoutes from "./routes/uploads.routes";

const app: express.Application = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(errorHandler);
export default app;
