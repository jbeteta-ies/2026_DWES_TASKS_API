import * as adminService from "../services/admin.service.js";

/** Adapta las estadísticas del servicio a una respuesta HTTP 200. */
export async function getStats(_req, res) {
  const stats = await adminService.getStats();

  return res.status(200).json(stats);
}
