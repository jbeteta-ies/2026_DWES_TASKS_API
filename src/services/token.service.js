import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// La API firma todos sus access tokens con HS256 y solo acepta ese algoritmo.
const JWT_ALGORITHM = "HS256";

/**
 * Firma un access token con el id y rol del usuario autenticado.
 * El token está firmado, no cifrado: su payload se puede leer.
 * @param {{id: number, role: string}} user Usuario público autenticado.
 * @returns {string} JWT firmado con caducidad y claims de emisor y audiencia.
 */
export function signAccessToken(user) {
  return jwt.sign(
    {
      role: user.role
    },
    env.jwt.secret,
    {
      algorithm: JWT_ALGORITHM,
      subject: String(user.id),
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
      expiresIn: env.jwt.expiresIn
    }
  );
}

/**
 * Comprueba firma, algoritmo, caducidad, emisor y audiencia.
 * @param {string} token JWT recibido en la cabecera Authorization.
 * @returns {object} Claims verificados; nunca usar `decode` para autenticar.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.secret, {
    algorithms: [JWT_ALGORITHM],
    issuer: env.jwt.issuer,
    audience: env.jwt.audience
  });
}

/**
 * Decodifica para inspección didáctica; el resultado no está verificado.
 * @param {string} token JWT que se desea inspeccionar.
 * @returns {object|null} Segmentos decodificados o null si no es interpretable.
 */
export function decodeToken(token) {
  return jwt.decode(token, { complete: true });
}
