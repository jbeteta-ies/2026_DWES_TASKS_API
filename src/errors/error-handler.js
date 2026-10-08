import { AppError } from "./AppError.js";

export function notFoundHandler(_req, res) {
  return res.status(404).json({
    error: "Ruta no encontrada"
  });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      error: "El cuerpo JSON no es válido"
    });
  }

  if (error instanceof AppError) {
    const body = {
      error: error.message
    };

    if (error.details !== undefined) {
      body.details = error.details;
    }

    return res.status(error.status).json(body);
  }

  if (error.code === "ECONNREFUSED") {
    return res.status(503).json({
      error: "La base de datos no está disponible"
    });
  }

  return res.status(500).json({
    error: "Error interno del servidor"
  });
}
