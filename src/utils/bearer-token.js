/**
 * Extrae el token de una cabecera Authorization con esquema Bearer.
 * Esta función solo interpreta el texto; la firma se valida por separado.
 * @param {string|undefined} authorizationHeader Cabecera HTTP recibida.
 * @returns {string|null} Token sin el prefijo Bearer o null si el formato falla.
 */
export function extractBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") {
    return null;
  }

  const parts = authorizationHeader.trim().split(/\s+/);

  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !== "bearer" ||
    parts[1] === ""
  ) {
    return null;
  }

  return parts[1];
}
