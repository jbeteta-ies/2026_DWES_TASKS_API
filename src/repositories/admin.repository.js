import { pool } from "../config/database.js";

/** Recupera los totales generales que se muestran en el panel de administración. */
export async function findStats() {
  const [[usersResult]] = await pool.execute(`
    SELECT COUNT(*) AS totalUsers
    FROM users
  `);

  const [[tasksResult]] = await pool.execute(`
    SELECT COUNT(*) AS totalTasks
    FROM tasks
  `);

  return {
    totalUsers: Number(usersResult.totalUsers),
    totalTasks: Number(tasksResult.totalTasks)
  };
}
