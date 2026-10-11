import { AppError } from "../errors/AppError.js";
import * as usersRepository from "../repositories/users.repository.js";

/**
 * Convierte y valida el claim `sub`, y obtiene el usuario público actual.
 * @param {string|number} idValue Valor del claim sub procedente del JWT verificado.
 * @returns {Promise<object>} Usuario público recuperado de MySQL.
 */
export async function getCurrentUserById(idValue) {
  const userId = Number(idValue);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError(401, "El token no contiene un sujeto válido");
  }

  const user = await usersRepository.findPublicById(userId);

  if (!user) {
    throw new AppError(401, "El usuario del token ya no existe");
  }

  return user;
}
