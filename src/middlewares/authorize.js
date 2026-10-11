import { AppError } from "../errors/AppError.js";

/**
 * Crea middleware que permite continuar solo a los roles indicados.
 * @param {...string} allowedRoles Roles que pueden acceder a la ruta.
 * @returns {import("express").RequestHandler} Middleware de autorización.
 */
export function authorize(...allowedRoles) {
  return function authorizationMiddleware(req, res, next) {
    if (!req.user) {
      throw new AppError(401, "Se requiere autenticación");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        403,
        "No tienes permisos para realizar esta operación"
      );
    }

    next();
  };
}
