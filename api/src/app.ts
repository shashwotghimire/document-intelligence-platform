import express from "express";
import "dotenv/config";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import healthRoutes from "./routes/health.route";
import uploadRoutes from "./routes/uploads.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/messages.route";
import { swaggerSpec } from "./config/swagger";

const app: express.Application = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler);
export default app;
