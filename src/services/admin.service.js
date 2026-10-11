import * as adminRepository from "../repositories/admin.repository.js";

/** Obtiene las estadísticas agregadas que puede consultar un administrador. */
export async function getStats() {
  return adminRepository.findStats();
}
