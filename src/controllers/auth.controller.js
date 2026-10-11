import * as authService from "../services/auth.service.js";
import { env } from "../config/env.js";

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

/** Devuelve el usuario que authenticate ya ha cargado en req.user. */
export async function me(req, res) {
  return res.status(200).json({ user: req.user });
}
