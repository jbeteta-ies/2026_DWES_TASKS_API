import express from "express";
import {
  errorHandler,
  notFoundHandler
} from "./errors/error-handler.js";
import { authRouter } from "./routes/auth.routes.js";
import { tasksRouter } from "./routes/tasks.routes.js";

export const app = express();

app.disable("x-powered-by");

app.use(express.json({
  limit: "100kb"
}));

app.get("/", (_req, res) => {
  return res.status(200).json({
    name: "Tasks API",
    version: "1.0.0"
  });
});

app.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok"
  });
});

app.use("/auth", authRouter);
app.use("/tasks", tasksRouter);

app.use(notFoundHandler);
app.use(errorHandler);
