import { AppError } from "../errors/AppError.js";
import { extractBearerToken } from "../utils/bearer-token.js";
import { getCurrentUserById } from "../services/current-user.service.js";
import { verifyAccessToken } from "../services/token.service.js";

/**
 * Verifica el Bearer token, obtiene el usuario actual y continúa la petición.
 * Deja el usuario público en req.user y los claims comprobados en req.auth.
 * @param {import("express").Request} req Petición que contiene Authorization.
 * @param {import("express").Response} res Respuesta HTTP de Express.
 * @param {import("express").NextFunction} next Siguiente middleware o controlador.
 */
export async function authenticate(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw new AppError(401, "Se requiere un token Bearer");
  }

  let payload;

  try {
    // verify comprueba la firma y los claims configurados; decode no sirve aquí.
    payload = verifyAccessToken(token);
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      throw new AppError(401, "Token no válido o caducado");
    }

    throw error;
  }

  const user = await getCurrentUserById(payload.sub);

  // Los controladores posteriores reciben identidad confiable y datos actuales.
  req.auth = { tokenPayload: payload };
  req.user = user;

  next();
}
