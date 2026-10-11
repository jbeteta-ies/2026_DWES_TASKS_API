import bcrypt from "bcrypt";
import { env } from "../config/env.js";

/**
 * Genera un hash bcrypt; la contraseña original no se guarda en la base de datos.
 * @param {string} password Contraseña elegida por el usuario.
 * @returns {Promise<string>} Hash que se almacenará en `password_hash`.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, env.passwordRounds);
}

/**
 * Compara una contraseña recibida con el hash guardado, sin descifrarlo.
 * @param {string} password Contraseña recibida en el login.
 * @param {string} passwordHash Hash recuperado de la base de datos.
 * @returns {Promise<boolean>} Indica si ambas credenciales coinciden.
 */
export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
