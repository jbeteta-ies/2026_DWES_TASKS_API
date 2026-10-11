import { AppError } from "../errors/AppError.js";
import * as usersRepository from "../repositories/users.repository.js";
import { hashPassword, verifyPassword } from "./password.service.js";
import { signAccessToken } from "./token.service.js";
import {
  normalizeLoginInput,
  normalizeRegisterInput,
  validateLogin,
  validateRegister
} from "../validators/auth.validator.js";

/**
 * Valida, normaliza y crea una cuenta con contraseña almacenada como hash.
 * @param {unknown} data Datos de registro enviados por el cliente.
 * @returns {Promise<object>} Usuario público, sin contraseña ni hash.
 */
export async function register(data) {
  const errors = validateRegister(data);

  if (errors.length > 0) {
    throw new AppError(422, "Datos de registro no válidos", errors);
  }

  const input = normalizeRegisterInput(data);
  const userExists = await usersRepository.existsByEmail(input.email);

  if (userExists) {
    throw new AppError(409, "Ya existe un usuario con ese correo");
  }

  // Se calcula el hash solo después de validar y comprobar el correo.
  const passwordHash = await hashPassword(input.password);

  try {
    return await usersRepository.create({
      name: input.name,
      email: input.email,
      passwordHash
    });
  } catch (error) {
    // La restricción UNIQUE de MySQL también cubre dos registros simultáneos.
    if (error.code === "ER_DUP_ENTRY") {
      throw new AppError(409, "Ya existe un usuario con ese correo");
    }

    throw error;
  }
}

/**
 * Comprueba credenciales y devuelve únicamente datos públicos del usuario.
 * @param {unknown} data Credenciales de acceso enviadas por el cliente.
 * @returns {Promise<{user: object, accessToken: string}>} Usuario público y JWT.
 */
export async function login(data) {
  const errors = validateLogin(data);

  if (errors.length > 0) {
    throw new AppError(422, "Datos de acceso no válidos", errors);
  }

  const input = normalizeLoginInput(data);
  const user = await usersRepository.findPrivateByEmail(input.email);

  // Mismo mensaje para que no pueda deducirse si el correo está registrado.
  if (!user) {
    throw new AppError(401, "Correo o contraseña incorrectos");
  }

  const passwordMatches = await verifyPassword(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError(401, "Correo o contraseña incorrectos");
  }

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  // El token se emite únicamente después de validar las credenciales.
  return {
    user: publicUser,
    accessToken: signAccessToken(publicUser)
  };
}
