import { Router } from "express";
import { getStats } from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const adminRouter = Router();

// Primero autenticamos y después comprobamos que el usuario tenga rol admin.
adminRouter.use(authenticate);
adminRouter.use(authorize("admin"));

adminRouter.get("/stats", getStats);
