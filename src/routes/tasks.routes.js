import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  replaceTask,
  updateTask
} from "../controllers/tasks.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export const tasksRouter = Router();

// El middleware se registra antes de las rutas para proteger todas las tareas.
tasksRouter.use(authenticate);

tasksRouter.get("/", listTasks);
tasksRouter.get("/:id", getTask);
tasksRouter.post("/", createTask);
tasksRouter.put("/:id", replaceTask);
tasksRouter.patch("/:id", updateTask);
tasksRouter.delete("/:id", deleteTask);
