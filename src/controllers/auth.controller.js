import * as authService from "../services/auth.service.js";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { extractBearerToken } from "../utils/bearer-token.js";

/** Convierte el resultado del registro en una respuesta HTTP 201. */
export async function register(req, res) {
  const user = await authService.register(req.body);

  return res
    .status(201)
    .location(`/users/${user.id}`)
    .json({ user });
}

/** Devuelve el usuario público cuando correo y contraseña son correctos. */
export async function login(req, res) {
  const result = await authService.login(req.body);

  return res.status(200).json({
    tokenType: "Bearer",
    expiresIn: env.jwt.expiresIn,
    ...result
  });
}

/** Verifica el Bearer token y devuelve los datos actuales del usuario. */
export async function me(req, res) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw new AppError(401, "Se requiere un token Bearer");
  }

  const user = await authService.getCurrentUser(token);

  return res.status(200).json({ user });
}
